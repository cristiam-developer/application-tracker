import { createHash } from "crypto";
import { db } from "@/lib/db";
import type { SearchResult } from "./types";
import type { JobSource } from "@/types";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export function buildCacheKey(
  query: string,
  location: string | undefined,
  sources: JobSource[]
): string {
  const normalized = [
    query.toLowerCase().trim(),
    (location || "").toLowerCase().trim(),
    [...sources].sort().join(","),
  ].join("|");

  return createHash("sha256").update(normalized).digest("hex");
}

export async function getCachedResults(
  queryHash: string
): Promise<SearchResult[] | null> {
  const cached = await db.searchCache.findUnique({
    where: { queryHash },
  });

  if (!cached) return null;

  if (cached.expiresAt < new Date()) {
    // Expired — delete and return null
    await db.searchCache.delete({ where: { queryHash } }).catch(() => {});
    return null;
  }

  try {
    return JSON.parse(cached.results) as SearchResult[];
  } catch {
    return null;
  }
}

export async function setCachedResults(
  queryHash: string,
  query: string,
  location: string | undefined,
  sources: JobSource[],
  results: SearchResult[]
): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_TTL_MS);

  await db.searchCache.upsert({
    where: { queryHash },
    create: {
      queryHash,
      query,
      location: location || null,
      sources: sources.join(","),
      results: JSON.stringify(results),
      cachedAt: now,
      expiresAt,
    },
    update: {
      results: JSON.stringify(results),
      cachedAt: now,
      expiresAt,
    },
  });

  // Opportunistic cleanup: 10% chance per write
  if (Math.random() < 0.1) {
    cleanExpiredCache().catch(() => {});
  }
}

export async function cleanExpiredCache(): Promise<number> {
  const result = await db.searchCache.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return result.count;
}
