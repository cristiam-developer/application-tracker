import { Badge } from "@/components/ui/badge";
import { SOURCE_CONFIG, type JobSource } from "@/types";

type SourceBadgeProps = {
  source: JobSource;
};

export function SourceBadge({ source }: SourceBadgeProps) {
  const config = SOURCE_CONFIG[source];
  return (
    <Badge
      variant="secondary"
      className={`${config.bgColor} ${config.color} border-0 text-xs`}
    >
      {config.label}
    </Badge>
  );
}
