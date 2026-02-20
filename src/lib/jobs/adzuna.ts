import type { SearchResult } from "./types";

const APP_ID = process.env.ADZUNA_APP_ID;
const APP_KEY = process.env.ADZUNA_APP_KEY;
const BASE_URL = "https://api.adzuna.com/v1/api/jobs/us/search";

export function isAdzunaAvailable(): boolean {
  return !!APP_ID && !!APP_KEY;
}

export async function searchAdzuna(
  query: string,
  location?: string,
  page = 1,
  limit = 10
): Promise<SearchResult[]> {
  if (!APP_ID || !APP_KEY) return [];

  try {
    const params = new URLSearchParams({
      app_id: APP_ID,
      app_key: APP_KEY,
      results_per_page: String(limit),
      what: query,
      content_type: "application/json",
    });

    if (location) {
      params.set("where", location);
    }

    const res = await fetch(`${BASE_URL}/${page}?${params}`, {
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.error(`Adzuna API error: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const jobs = data.results ?? [];

    return jobs.map(
      (job: Record<string, unknown>): SearchResult => ({
        title: (job.title as string) || "Untitled",
        company:
          ((job.company as Record<string, unknown>)?.display_name as string) ||
          "Unknown",
        location:
          ((job.location as Record<string, unknown>)?.display_name as string) ||
          null,
        salary: formatAdzunaSalary(
          job.salary_min as number | undefined,
          job.salary_max as number | undefined
        ),
        url: (job.redirect_url as string) || "",
        source: "adzuna",
        sourceId: (job.id as string)?.toString() || null,
        description: truncate((job.description as string) || null, 500),
        postedAt: (job.created as string) || null,
      })
    );
  } catch (error) {
    console.error("Adzuna fetch error:", error);
    return [];
  }
}

function formatAdzunaSalary(
  min?: number,
  max?: number
): string | null {
  if (!min && !max) return null;
  if (min && max)
    return `$${Math.round(min).toLocaleString()}-$${Math.round(max).toLocaleString()}/yr`;
  if (min) return `$${Math.round(min).toLocaleString()}+/yr`;
  return `Up to $${Math.round(max!).toLocaleString()}/yr`;
}

function truncate(str: string | null, maxLen: number): string | null {
  if (!str) return null;
  return str.length > maxLen ? str.slice(0, maxLen) + "..." : str;
}
