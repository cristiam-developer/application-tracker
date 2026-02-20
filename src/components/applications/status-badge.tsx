import { Badge } from "@/components/ui/badge";
import { STATUS_CONFIG, type ApplicationStatus } from "@/types";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as ApplicationStatus] ?? {
    label: status,
    color: "bg-gray-500",
  };

  return (
    <Badge variant="secondary" className="gap-1.5">
      <span className={cn("h-2 w-2 rounded-full", config.color)} />
      {config.label}
    </Badge>
  );
}
