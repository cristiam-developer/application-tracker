import type { SearchResult } from "./types";
import type { JobSource } from "@/types";

const ENABLE_SCRAPER = process.env.ENABLE_SCRAPER === "true";
const MAX_PAGES = 5;
const DELAY_MS = 2000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

// Lazy-loaded singleton browser
let browserPromise: Promise<import("playwright").Browser> | null = null;

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = import("playwright").then(async (pw) => {
      const browser = await pw.chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-blink-features=AutomationControlled"],
      });
      return browser;
    });
  }
  return browserPromise;
}

export function isScraperAvailable(): boolean {
  return ENABLE_SCRAPER;
}

export async function scrapeIndeed(
  query: string,
  location?: string
): Promise<SearchResult[]> {
  if (!ENABLE_SCRAPER) return [];
  return scrapeSource("indeed", query, location);
}

export async function scrapeGlassdoor(
  query: string,
  location?: string
): Promise<SearchResult[]> {
  if (!ENABLE_SCRAPER) return [];
  return scrapeSource("glassdoor", query, location);
}

async function scrapeSource(
  source: JobSource,
  query: string,
  location?: string
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  let browser;

  try {
    browser = await getBrowser();
    const context = await browser.newContext({
      userAgent: USER_AGENT,
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    // Block unnecessary resources for speed
    await page.route("**/*.{png,jpg,jpeg,gif,svg,css,font,woff,woff2}", (route) =>
      route.abort()
    );

    for (let i = 0; i < MAX_PAGES; i++) {
      const url = buildUrl(source, query, location, i);
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

      // Check for CAPTCHA
      const content = await page.content();
      if (
        content.includes("captcha") ||
        content.includes("CAPTCHA") ||
        content.includes("unusual traffic")
      ) {
        console.warn(`${source}: CAPTCHA detected, aborting`);
        break;
      }

      const pageResults = await extractResults(page, source);
      results.push(...pageResults);

      if (pageResults.length === 0) break;
      if (i < MAX_PAGES - 1) {
        await delay(DELAY_MS);
      }
    }

    await context.close();
  } catch (error) {
    console.error(`${source} scraping error:`, error);
  }

  return results;
}

function buildUrl(
  source: JobSource,
  query: string,
  location: string | undefined,
  page: number
): string {
  const q = encodeURIComponent(query);
  const l = location ? encodeURIComponent(location) : "";

  if (source === "indeed") {
    const start = page * 10;
    return `https://www.indeed.com/jobs?q=${q}${l ? `&l=${l}` : ""}&start=${start}`;
  }

  // glassdoor
  return `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${q}${l ? `&locT=C&locKeyword=${l}` : ""}&p=${page + 1}`;
}

async function extractResults(
  page: import("playwright").Page,
  source: JobSource
): Promise<SearchResult[]> {
  if (source === "indeed") {
    return extractIndeedResults(page);
  }
  return extractGlassdoorResults(page);
}

async function extractIndeedResults(
  page: import("playwright").Page
): Promise<SearchResult[]> {
  return page.evaluate(() => {
    const cards = document.querySelectorAll('[data-testid="slider_item"], .job_seen_beacon, .resultContent');
    const results: Array<{
      title: string;
      company: string;
      location: string | null;
      salary: string | null;
      url: string;
      source: "indeed";
      sourceId: string | null;
      description: string | null;
      postedAt: string | null;
    }> = [];

    cards.forEach((card) => {
      const titleEl = card.querySelector("h2 a, .jobTitle a, a[data-jk]");
      const companyEl = card.querySelector("[data-testid='company-name'], .companyName, .company");
      const locationEl = card.querySelector("[data-testid='text-location'], .companyLocation, .location");
      const salaryEl = card.querySelector("[data-testid='attribute_snippet_testid'], .salary-snippet-container, .estimated-salary");
      const snippetEl = card.querySelector(".job-snippet, .underShelfFooter, [data-testid='jobsnippet_footer']");

      const title = titleEl?.textContent?.trim();
      const href = titleEl?.getAttribute("href");

      if (title && href) {
        results.push({
          title,
          company: companyEl?.textContent?.trim() || "Unknown",
          location: locationEl?.textContent?.trim() || null,
          salary: salaryEl?.textContent?.trim() || null,
          url: href.startsWith("http") ? href : `https://www.indeed.com${href}`,
          source: "indeed",
          sourceId: titleEl?.getAttribute("data-jk") || null,
          description: snippetEl?.textContent?.trim()?.slice(0, 500) || null,
          postedAt: null,
        });
      }
    });

    return results;
  });
}

async function extractGlassdoorResults(
  page: import("playwright").Page
): Promise<SearchResult[]> {
  return page.evaluate(() => {
    const cards = document.querySelectorAll('[data-test="jobListing"], .react-job-listing, li[data-id]');
    const results: Array<{
      title: string;
      company: string;
      location: string | null;
      salary: string | null;
      url: string;
      source: "glassdoor";
      sourceId: string | null;
      description: string | null;
      postedAt: string | null;
    }> = [];

    cards.forEach((card) => {
      const titleEl = card.querySelector('[data-test="job-title"], .job-title, a.jobLink');
      const companyEl = card.querySelector('[data-test="emp-name"], .job-search-key-l2hmjg');
      const locationEl = card.querySelector('[data-test="emp-location"], .job-search-key-1p7g74f');
      const salaryEl = card.querySelector('[data-test="detailSalary"], .salary-estimate');

      const title = titleEl?.textContent?.trim();
      const href = titleEl?.closest("a")?.getAttribute("href") || titleEl?.getAttribute("href");

      if (title && href) {
        results.push({
          title,
          company: companyEl?.textContent?.trim() || "Unknown",
          location: locationEl?.textContent?.trim() || null,
          salary: salaryEl?.textContent?.trim() || null,
          url: href.startsWith("http") ? href : `https://www.glassdoor.com${href}`,
          source: "glassdoor",
          sourceId: card.getAttribute("data-id") || null,
          description: null,
          postedAt: null,
        });
      }
    });

    return results;
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
