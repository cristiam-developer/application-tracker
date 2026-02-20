import { formatDistanceToNow, format } from "date-fns";
import { STATUS_CONFIG, type ApplicationStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusChange {
  id: string;
  fromStatus: string;
  toStatus: string;
  changedAt: Date | string;
  notes: string | null;
}

interface StatusTimelineProps {
  history: StatusChange[];
}

export function StatusTimeline({ history }: StatusTimelineProps) {
  if (history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No status changes yet.</p>
    );
  }

  return (
    <div className="space-y-0">
      {history.map((entry, index) => {
        const toConfig = STATUS_CONFIG[entry.toStatus as ApplicationStatus];
        const date = new Date(entry.changedAt);
        const isFirst = index === 0;

        return (
          <div key={entry.id} className="relative flex gap-3 pb-6 last:pb-0">
            {/* Vertical line */}
            {index < history.length - 1 && (
              <div className="absolute left-[9px] top-5 bottom-0 w-px bg-border" />
            )}

            {/* Dot */}
            <div
              className={cn(
                "mt-1 h-[18px] w-[18px] shrink-0 rounded-full border-2 border-background",
                isFirst ? "ring-2 ring-ring/20" : "",
                toConfig?.color ?? "bg-gray-500"
              )}
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                {toConfig?.label ?? entry.toStatus}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(date, { addSuffix: true })} &middot;{" "}
                {format(date, "MMM d, yyyy")}
              </p>
              {entry.notes && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {entry.notes}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
