import { Skeleton } from "@/components/ui/skeleton";

const COLUMN_COUNT = 7;

export default function BoardLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-5 w-72" />
      </div>

      {/* Kanban columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Array.from({ length: COLUMN_COUNT }).map((_, col) => (
          <div
            key={col}
            className="flex w-72 shrink-0 flex-col rounded-lg border bg-card p-3"
          >
            {/* Column header */}
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-6 rounded-full" />
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {Array.from({ length: col < 3 ? 3 : 1 }).map((_, card) => (
                <div key={card} className="rounded-md border bg-background p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-2 pt-1">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
