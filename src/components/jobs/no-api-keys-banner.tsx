import { AlertTriangle } from "lucide-react";

type NoApiKeysBannerProps = {
  availableSources: { source: string; available: boolean }[];
};

export function NoApiKeysBanner({ availableSources }: NoApiKeysBannerProps) {
  const anyAvailable = availableSources.some((s) => s.available);

  if (anyAvailable) return null;

  return (
    <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-yellow-500">
            No job search sources configured
          </p>
          <p className="text-sm text-muted-foreground">
            Add API keys in your <code>.env</code> file to enable job search.
            Supported sources: JSearch (RapidAPI), Adzuna, or enable the
            Playwright scraper for Indeed/Glassdoor.
          </p>
        </div>
      </div>
    </div>
  );
}
