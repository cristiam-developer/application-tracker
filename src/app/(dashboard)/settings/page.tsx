export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { getGmailConnectionStatus } from "@/lib/queries/settings";
import { GmailSettingsCard } from "@/components/settings/gmail-settings-card";
import { SettingsSyncSection } from "@/components/settings/settings-sync-section";

export default async function SettingsPage() {
  const [gmailStatus, syncState, pendingCount] = await Promise.all([
    getGmailConnectionStatus(),
    db.gmailSyncState.findUnique({ where: { id: "singleton" } }),
    db.setting.count({ where: { key: { startsWith: "pending_review_" } } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure Gmail sync, resume profile, and preferences.
        </p>
      </div>
      <GmailSettingsCard
        connected={gmailStatus.connected}
        email={gmailStatus.email}
      />
      {gmailStatus.connected && (
        <SettingsSyncSection
          initialSyncStatus={{
            lastSyncAt: syncState?.lastSyncAt?.toISOString() ?? null,
            syncInProgress: syncState?.syncInProgress ?? false,
            totalSynced: syncState?.totalSynced ?? 0,
            pendingReviewCount: pendingCount,
          }}
        />
      )}
    </div>
  );
}
