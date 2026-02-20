"use client";

import { useState } from "react";
import { GmailSyncCard } from "./gmail-sync-card";
import { PendingReviewsCard } from "./pending-reviews-card";

type SettingsSyncSectionProps = {
  initialSyncStatus: {
    lastSyncAt: string | null;
    syncInProgress: boolean;
    totalSynced: number;
    pendingReviewCount: number;
  };
};

export function SettingsSyncSection({
  initialSyncStatus,
}: SettingsSyncSectionProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <GmailSyncCard
        initialStatus={initialSyncStatus}
        onSyncComplete={() => setRefreshKey((k) => k + 1)}
      />
      <PendingReviewsCard refreshKey={refreshKey} />
    </>
  );
}
