import { SearchResults } from "@/components/jobs/search-results";
import { getAvailableSources } from "@/lib/jobs/aggregator";

export default function JobSearchPage() {
  const availableSources = getAvailableSources();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Job Search</h1>
        <p className="text-muted-foreground">
          Search for jobs across multiple platforms.
        </p>
      </div>
      <SearchResults availableSources={availableSources} />
    </div>
  );
}
