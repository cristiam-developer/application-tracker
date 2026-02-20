"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, ExternalLink, MapPin, DollarSign, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SourceBadge } from "./source-badge";
import type { JobSource } from "@/types";

export type JobCardData = {
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
  url: string;
  source: JobSource;
  sourceId: string | null;
  description: string | null;
  postedAt: string | null;
};

type JobCardProps = {
  job: JobCardData;
  isSaved?: boolean;
  onSaveToggle?: (saved: boolean) => void;
};

export function JobCard({ job, isSaved: initialSaved = false, onSaveToggle }: JobCardProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/jobs/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          url: job.url,
          source: job.source,
          sourceId: job.sourceId,
          description: job.description,
        }),
      });

      if (!res.ok) throw new Error("Failed to save job");

      setSaved(true);
      onSaveToggle?.(true);
      toast.success("Job saved");
    } catch {
      toast.error("Failed to save job");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="transition-colors hover:border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <h3 className="truncate text-sm font-semibold leading-tight">
              {job.title}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{job.company}</span>
            </div>
          </div>
          <SourceBadge source={job.source} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {job.location}
            </span>
          )}
          {job.salary && (
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {job.salary}
            </span>
          )}
        </div>

        {job.description && (
          <p className="line-clamp-3 text-xs text-muted-foreground">
            {job.description}
          </p>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            asChild
          >
            <a href={job.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-3 w-3" />
              View
            </a>
          </Button>
          <Button
            variant={saved ? "secondary" : "outline"}
            size="sm"
            className="h-7 text-xs"
            onClick={handleSave}
            disabled={saving || saved}
          >
            {saved ? (
              <>
                <BookmarkCheck className="mr-1 h-3 w-3" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="mr-1 h-3 w-3" />
                {saving ? "Saving..." : "Save"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
