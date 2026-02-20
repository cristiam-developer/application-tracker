import { Badge } from "@/components/ui/badge";
import { PLATFORM_CONFIG, type Platform } from "@/types";

export function PlatformBadge({ platform }: { platform: string }) {
  const config = PLATFORM_CONFIG[platform as Platform] ?? {
    label: platform,
  };

  return <Badge variant="outline">{config.label}</Badge>;
}
