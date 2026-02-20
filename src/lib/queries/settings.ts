import { db } from "@/lib/db";

export async function getSetting(key: string): Promise<string | null> {
  const setting = await db.setting.findUnique({ where: { key } });
  return setting?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function deleteSetting(key: string): Promise<void> {
  await db.setting.deleteMany({ where: { key } });
}

export type GmailConnectionStatus = {
  connected: boolean;
  email: string | null;
};

export async function getGmailConnectionStatus(): Promise<GmailConnectionStatus> {
  const [token, email] = await Promise.all([
    getSetting("google_access_token"),
    getSetting("google_email"),
  ]);

  return {
    connected: !!token && token.length > 0,
    email: email,
  };
}

export async function disconnectGmail(): Promise<void> {
  const keysToDelete = [
    "google_access_token",
    "google_refresh_token",
    "google_token_expiry",
    "google_email",
  ];

  await db.$transaction([
    ...keysToDelete.map((key) => db.setting.deleteMany({ where: { key } })),
    db.gmailSyncState.update({
      where: { id: "singleton" },
      data: {
        lastSyncAt: null,
        lastHistoryId: null,
        syncInProgress: false,
      },
    }),
  ]);
}
