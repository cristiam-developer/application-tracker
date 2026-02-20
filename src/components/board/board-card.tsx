import { format } from "date-fns";
import { Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BoardApplication } from "@/types";
import { BoardCardMenu } from "./board-card-menu";

interface BoardCardProps {
  application: BoardApplication;
  isDragging: boolean;
  onDelete: () => void;
}

export function BoardCard({
  application,
  isDragging,
  onDelete,
}: BoardCardProps) {
  return (
    <Card
      className={cn(
        "cursor-grab active:cursor-grabbing transition-shadow",
        isDragging && "shadow-lg ring-2 ring-primary/20"
      )}
    >
      <CardContent className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {application.companyName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {application.positionTitle}
            </p>
          </div>
          <BoardCardMenu application={application} onDelete={onDelete} />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(application.applicationDate), "MMM d")}
          </span>
          {application.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="max-w-[100px] truncate">
                {application.location}
              </span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
