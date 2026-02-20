import type { SearchResult, SearchParams, SearchResponse } from "./types";
import type { JobSource } from "@/types";
import { searchJSearch, isJSearchAvailable } from "./jsearch";
import { searchAdzuna, isAdzunaAvailable } from "./adzuna";
import { scrapeIndeed, scrapeGlassdoor, isScraperAvailable } from "./scraper";
import { buildCacheKey, getCachedResults, setCachedResults } from "./cache";

type SourceFetcher = {
  source: JobSource;
  available: boolean;
  fetch: (query: string, location?: string) => Promise<SearchResult[]>;
};

const SOURCE_FETCHERS: SourceFetcher[] = [
  {
    source: "jsearch",
    available: isJSearchAvailable(),
    fetch: (q, l) => searchJSearch(q, l, 1, 50),
  },
  {
    source: "adzuna",
    available: isAdzunaAvailable(),
    fetch: (q, l) => searchAdzuna(q, l, 1, 50),
  },
  {
    source: "indeed",
    available: isScraperAvailable(),
    fetch: (q, l) => scrapeIndeed(q, l),
  },
  {
    source: "glassdoor",
    available: isScraperAvailable(),
    fetch: (q, l) => scrapeGlassdoor(q, l),
  },
];

export function getAvailableSources(): { source: JobSource; available: boolean }[] {
  return SOURCE_FETCHERS.map(({ source, available }) => ({ source, available }));
}

export async function searchJobs(params: SearchParams): Promise<SearchResponse> {
  const { query, location, sources, page, limit } = params;

  // Check cache first
  const cacheKey = buildCacheKey(query, location, sources);
  const cached = await getCachedResults(cacheKey);

  if (cached) {
    return paginateResults(cached, page, limit, sources, true);
  }

  // Fetch from requested sources in parallel
  const activeFetchers = SOURCE_FETCHERS.filter(
    (f) => sources.includes(f.source) && f.available
  );

  const fetchPromises = activeFetchers.map(async (fetcher) => {
    try {
      return await fetcher.fetch(query, location);
    } catch (error) {
      console.error(`Error fetching from ${fetcher.source}:`, error);
      return [] as SearchResult[];
    }
  });

  const resultArrays = await Promise.allSettled(fetchPromises);
  const allResults: SearchResult[] = [];

  resultArrays.forEach((result) => {
    if (result.status === "fulfilled") {
      allResults.push(...result.value);
    }
  });

  // Deduplicate
  const deduped = deduplicateResults(allResults);

  // Sort by relevance (title match first, then by date)
  const queryLower = query.toLowerCase();
  deduped.sort((a, b) => {
    const aMatch = a.title.toLowerCase().includes(queryLower) ? 1 : 0;
    const bMatch = b.title.toLowerCase().includes(queryLower) ? 1 : 0;
    if (aMatch !== bMatch) return bMatch - aMatch;

    // Then by posted date (newest first)
    if (a.postedAt && b.postedAt) {
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    }
    if (a.postedAt) return -1;
    if (b.postedAt) return 1;
    return 0;
  });

  // Cache the full result set
  await setCachedResults(cacheKey, query, location, sources, deduped).catch(
    (error) => console.error("Cache write error:", error)
  );

  return paginateResults(deduped, page, limit, sources, false);
}

function paginateResults(
  results: SearchResult[],
  page: number,
  limit: number,
  requestedSources: JobSource[],
  cached: boolean
): SearchResponse {
  const start = (page - 1) * limit;
  const pageResults = results.slice(start, start + limit);

  // Count results per source
  const sourceCounts = new Map<JobSource, number>();
  for (const r of results) {
    sourceCounts.set(r.source, (sourceCounts.get(r.source) || 0) + 1);
  }

  return {
    results: pageResults,
    total: results.length,
    page,
    limit,
    sources: SOURCE_FETCHERS.filter((f) =>
      requestedSources.includes(f.source)
    ).map(({ source, available }) => ({
      source,
      available,
      count: sourceCounts.get(source) || 0,
    })),
    cached,
  };
}

function deduplicateResults(results: SearchResult[]): SearchResult[] {
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const unique: SearchResult[] = [];

  for (const result of results) {
    const normalizedUrl = result.url.replace(/[?#].*$/, "").toLowerCase();
    if (seenUrls.has(normalizedUrl)) continue;

    const titleKey = `${result.title.toLowerCase().replace(/[^a-z0-9]/g, "")}|${result.company.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    if (seenTitles.has(titleKey)) continue;

    seenUrls.add(normalizedUrl);
    seenTitles.add(titleKey);
    unique.push(result);
  }

  return unique;
}
