"use client";

import { useState } from "react";
import { ExternalLink, MapPin, DollarSign, Building2, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SourceBadge } from "./source-badge";
import { MarkAppliedDialog } from "./mark-applied-dialog";
import type { JobSource } from "@/types";

export type SavedJobData = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
  url: string;
  source: string;
  description: string | null;
  savedAt: string;
  applied: boolean;
};

type SavedJobCardProps = {
  job: SavedJobData;
  onRemove: (id: string) => void;
  onApplied: (id: string) => void;
};

export function SavedJobCard({ job, onRemove, onApplied }: SavedJobCardProps) {
  const [removing, setRemoving] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);

  async function handleRemove() {
    setRemoving(true);
    try {
      const res = await fetch(`/api/jobs/saved/${job.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove");
      onRemove(job.id);
      toast.success("Job removed");
    } catch {
      toast.error("Failed to remove job");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <>
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
            <div className="flex items-center gap-1.5">
              {job.applied && (
                <span className="flex items-center gap-1 rounded bg-green-500/20 px-1.5 py-0.5 text-xs text-green-500">
                  <CheckCircle2 className="h-3 w-3" />
                  Applied
                </span>
              )}
              <SourceBadge source={job.source as JobSource} />
            </div>
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
            <span>
              Saved {new Date(job.savedAt).toLocaleDateString()}
            </span>
          </div>

          {job.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground">
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
            {!job.applied && (
              <Button
                variant="default"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowApplyDialog(true)}
              >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Mark Applied
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-destructive hover:text-destructive"
              onClick={handleRemove}
              disabled={removing}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              {removing ? "Removing..." : "Remove"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <MarkAppliedDialog
        open={showApplyDialog}
        onOpenChange={setShowApplyDialog}
        job={job}
        onApplied={() => {
          onApplied(job.id);
          setShowApplyDialog(false);
        }}
      />
    </>
  );
}
