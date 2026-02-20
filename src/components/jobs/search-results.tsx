"use client";

import { useState, useCallback } from "react";
import { SearchForm } from "./search-form";
import { JobCardGrid, JobCardGridSkeleton } from "./job-card-grid";
import { NoApiKeysBanner } from "./no-api-keys-banner";
import { Button } from "@/components/ui/button";
import type { JobSource } from "@/types";
import type { JobCardData } from "./job-card";

type SourceInfo = { source: JobSource; available: boolean; count: number };

type SearchResultsProps = {
  availableSources: { source: JobSource; available: boolean }[];
};

export function SearchResults({ availableSources }: SearchResultsProps) {
  const [results, setResults] = useState<JobCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [cached, setCached] = useState(false);
  const [sourceInfo, setSourceInfo] = useState<SourceInfo[]>([]);
  const [savedUrls, setSavedUrls] = useState<Set<string>>(new Set());
  const [lastQuery, setLastQuery] = useState("");
  const [lastLocation, setLastLocation] = useState("");
  const [lastSources, setLastSources] = useState<JobSource[]>([]);

  const fetchResults = useCallback(
    async (query: string, location: string, sources: JobSource[], pageNum: number) => {
      setSearching(true);
      try {
        const params = new URLSearchParams({
          query,
          sources: sources.join(","),
          page: String(pageNum),
          limit: String(limit),
        });
        if (location) params.set("location", location);

        const res = await fetch(`/api/jobs/search?${params}`);
        if (!res.ok) throw new Error("Search failed");

        const data = await res.json();
        setResults(data.results);
        setTotal(data.total);
        setPage(pageNum);
        setCached(data.cached);
        setSourceInfo(data.sources);
        setSearched(true);
      } catch {
        setResults([]);
        setTotal(0);
      } finally {
        setSearching(false);
      }
    },
    [limit]
  );

  function handleSearch(query: string, location: string, sources: JobSource[]) {
    setLastQuery(query);
    setLastLocation(location);
    setLastSources(sources);
    fetchResults(query, location, sources, 1);
  }

  function handlePageChange(newPage: number) {
    fetchResults(lastQuery, lastLocation, lastSources, newPage);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <NoApiKeysBanner availableSources={availableSources} />

      <SearchForm
        onSearch={handleSearch}
        searching={searching}
        availableSources={availableSources}
      />

      {searching && <JobCardGridSkeleton />}

      {!searching && searched && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {total} result{total !== 1 ? "s" : ""} found
              </p>
              {cached && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                  cached
                </span>
              )}
            </div>
            {sourceInfo.length > 0 && (
              <div className="flex gap-2 text-xs text-muted-foreground">
                {sourceInfo
                  .filter((s) => s.count > 0)
                  .map((s) => (
                    <span key={s.source}>
                      {s.source}: {s.count}
                    </span>
                  ))}
              </div>
            )}
          </div>

          <JobCardGrid jobs={results} savedUrls={savedUrls} />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
