import type { SearchResult } from "./types";

const API_KEY = process.env.JSEARCH_API_KEY;
const BASE_URL = "https://jsearch.p.rapidapi.com/search";

export function isJSearchAvailable(): boolean {
  return !!API_KEY;
}

export async function searchJSearch(
  query: string,
  location?: string,
  page = 1,
  limit = 10
): Promise<SearchResult[]> {
  if (!API_KEY) return [];

  try {
    const params = new URLSearchParams({
      query: location ? `${query} in ${location}` : query,
      page: String(page),
      num_pages: "1",
      results_per_page: String(limit),
    });

    const res = await fetch(`${BASE_URL}?${params}`, {
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.error(`JSearch API error: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const jobs = data.data ?? [];

    return jobs.map(
      (job: Record<string, unknown>): SearchResult => ({
        title: (job.job_title as string) || "Untitled",
        company: (job.employer_name as string) || "Unknown",
        location: (job.job_city as string)
          ? `${job.job_city}, ${job.job_state || ""} ${job.job_country || ""}`.trim()
          : (job.job_country as string) || null,
        salary: formatSalary(
          job.job_min_salary as number | null,
          job.job_max_salary as number | null,
          job.job_salary_currency as string | null,
          job.job_salary_period as string | null
        ),
        url: (job.job_apply_link as string) || (job.job_google_link as string) || "",
        source: "jsearch",
        sourceId: (job.job_id as string) || null,
        description: truncate((job.job_description as string) || null, 500),
        postedAt: (job.job_posted_at_datetime_utc as string) || null,
      })
    );
  } catch (error) {
    console.error("JSearch fetch error:", error);
    return [];
  }
}

function formatSalary(
  min: number | null,
  max: number | null,
  currency: string | null,
  period: string | null
): string | null {
  if (!min && !max) return null;
  const curr = currency || "USD";
  const per = period ? `/${period.toLowerCase()}` : "";
  if (min && max) return `${curr} ${min.toLocaleString()}-${max.toLocaleString()}${per}`;
  if (min) return `${curr} ${min.toLocaleString()}+${per}`;
  return `Up to ${curr} ${max!.toLocaleString()}${per}`;
}

function truncate(str: string | null, maxLen: number): string | null {
  if (!str) return null;
  return str.length > maxLen ? str.slice(0, maxLen) + "..." : str;
}
