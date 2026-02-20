export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { getGmailConnectionStatus } from "@/lib/queries/settings";
import { getActiveProfile } from "@/lib/queries/resume";
import { GmailSettingsCard } from "@/components/settings/gmail-settings-card";
import { SettingsSyncSection } from "@/components/settings/settings-sync-section";
import { ResumeSettingsCard } from "@/components/settings/resume-settings-card";

export default async function SettingsPage() {
  const [gmailStatus, syncState, pendingCount, resumeProfile] =
    await Promise.all([
      getGmailConnectionStatus(),
      db.gmailSyncState.findUnique({ where: { id: "singleton" } }),
      db.setting.count({ where: { key: { startsWith: "pending_review_" } } }),
      getActiveProfile(),
    ]);

  const resumeData = resumeProfile
    ? {
        fileName: resumeProfile.fileName,
        skills: resumeProfile.skills
          ? JSON.parse(resumeProfile.skills)
          : [],
        jobTitles: resumeProfile.jobTitles
          ? JSON.parse(resumeProfile.jobTitles)
          : [],
        uploadedAt: resumeProfile.uploadedAt.toISOString(),
      }
    : null;

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
      <ResumeSettingsCard initialProfile={resumeData} />
    </div>
  );
}
