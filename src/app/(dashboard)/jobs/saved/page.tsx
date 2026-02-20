import { SavedJobsList } from "@/components/jobs/saved-jobs-list";

export default function SavedJobsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Saved Jobs</h1>
        <p className="text-muted-foreground">
          Jobs you have bookmarked for later.
        </p>
      </div>
      <SavedJobsList />
    </div>
  );
}
