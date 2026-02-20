"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { SavedJobData } from "./saved-job-card";

type MarkAppliedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: SavedJobData;
  onApplied: () => void;
};

export function MarkAppliedDialog({
  open,
  onOpenChange,
  job,
  onApplied,
}: MarkAppliedDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/jobs/saved/${job.id}`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to mark as applied");

      const data = await res.json();
      toast.success("Marked as applied — application created", {
        action: {
          label: "View",
          onClick: () => {
            window.location.href = `/applications/${data.applicationId}`;
          },
        },
      });
      onApplied();
    } catch {
      toast.error("Failed to mark as applied");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as Applied</DialogTitle>
          <DialogDescription>
            This will create a new application record for{" "}
            <strong>{job.title}</strong> at <strong>{job.company}</strong> with
            status &quot;Applied&quot;.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={submitting}>
            {submitting ? "Creating..." : "Confirm & Create Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
