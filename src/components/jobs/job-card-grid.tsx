import { Skeleton } from "@/components/ui/skeleton";
import { JobCard, type JobCardData } from "./job-card";

type JobCardGridProps = {
  jobs: JobCardData[];
  savedUrls: Set<string>;
};

export function JobCardGrid({ jobs, savedUrls }: JobCardGridProps) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
        No results found. Try adjusting your search query or sources.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job, i) => (
        <JobCard
          key={`${job.source}-${job.url}-${i}`}
          job={job}
          isSaved={savedUrls.has(job.url)}
        />
      ))}
    </div>
  );
}

export function JobCardGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-12 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-7 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
