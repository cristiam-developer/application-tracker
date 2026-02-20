"use client";

import { useState, useCallback } from "react";
import { RefreshCw, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SyncStatus = {
  lastSyncAt: string | null;
  syncInProgress: boolean;
  totalSynced: number;
  pendingReviewCount: number;
};

type SyncResult = {
  totalProcessed: number;
  autoImported: number;
  pendingReview: number;
  skippedDuplicates: number;
  errors: number;
};

type GmailSyncCardProps = {
  initialStatus: SyncStatus;
  onSyncComplete?: () => void;
};

export function GmailSyncCard({
  initialStatus,
  onSyncComplete,
}: GmailSyncCardProps) {
  const [status, setStatus] = useState<SyncStatus>(initialStatus);
  const [syncing, setSyncing] = useState(false);

  const handleSync = useCallback(
    async (fullSync: boolean) => {
      setSyncing(true);
      try {
        const res = await fetch("/api/gmail/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullSync }),
        });

        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error ?? "Sync failed");
        }

        const result = (await res.json()) as SyncResult;

        toast.success(
          `Sync complete: ${result.autoImported} imported, ${result.pendingReview} pending review, ${result.skippedDuplicates} duplicates skipped`
        );

        // Refresh status
        const statusRes = await fetch("/api/gmail/status");
        if (statusRes.ok) {
          setStatus((await statusRes.json()) as SyncStatus);
        }

        onSyncComplete?.();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Sync failed"
        );
      } finally {
        setSyncing(false);
      }
    },
    [onSyncComplete]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Gmail Sync
        </CardTitle>
        <CardDescription>
          Sync your Gmail inbox to automatically import job application emails.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Last Synced</p>
            <p className="font-medium">
              {status.lastSyncAt
                ? formatDistanceToNow(new Date(status.lastSyncAt), {
                    addSuffix: true,
                  })
                : "Never"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Imported</p>
            <p className="font-medium">{status.totalSynced}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Pending Review</p>
            <p className="font-medium">{status.pendingReviewCount}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => handleSync(false)}
            disabled={syncing}
            size="sm"
          >
            {syncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Sync Now
          </Button>
          <Button
            onClick={() => handleSync(true)}
            disabled={syncing}
            variant="outline"
            size="sm"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Full Rescan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
