"use client";

import { useState, useEffect, useCallback } from "react";
import { SavedJobCard, type SavedJobData } from "./saved-job-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Filter = "all" | "not_applied" | "applied";

export function SavedJobsList() {
  const [jobs, setJobs] = useState<SavedJobData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(
    async (f: Filter, p: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          filter: f,
          page: String(p),
          limit: String(limit),
        });
        const res = await fetch(`/api/jobs/saved?${params}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setJobs(data.jobs);
        setTotal(data.total);
        setPage(p);
      } catch {
        setJobs([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    fetchJobs(filter, 1);
  }, [filter, fetchJobs]);

  function handleRemove(id: string) {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    setTotal((prev) => prev - 1);
  }

  function handleApplied(id: string) {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, applied: true } : j))
    );
  }

  const totalPages = Math.ceil(total / limit);

  const tabs: { label: string; value: Filter }[] = [
    { label: "All", value: "all" },
    { label: "Not Applied", value: "not_applied" },
    { label: "Applied", value: "applied" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-4 space-y-3"
            >
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-24" />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-7 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          {filter === "all"
            ? "No saved jobs yet. Search for jobs and save them for later."
            : filter === "not_applied"
              ? "All saved jobs have been applied to."
              : "No applied jobs from saved list."}
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {total} saved job{total !== 1 ? "s" : ""}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <SavedJobCard
                key={job.id}
                job={job}
                onRemove={handleRemove}
                onApplied={handleApplied}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchJobs(filter, page - 1)}
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
                onClick={() => fetchJobs(filter, page + 1)}
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
