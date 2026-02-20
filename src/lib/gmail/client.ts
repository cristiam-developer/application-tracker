import { google } from "googleapis";
import { db } from "@/lib/db";
import { getSetting, setSetting } from "@/lib/queries/settings";
import type { GmailMessage } from "./types";

const GMAIL_SEARCH_QUERY = [
  'subject:("application" OR "applied" OR "thank you for applying" OR "application received" OR "we received your application" OR "application confirmation")',
  'NOT subject:("interview" OR "reminder" OR "newsletter" OR "unsubscribe")',
  "-from:me",
  "newer_than:90d",
].join(" ");

async function getOAuth2Client() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
  );

  const [accessToken, refreshToken, expiry] = await Promise.all([
    getSetting("google_access_token"),
    getSetting("google_refresh_token"),
    getSetting("google_token_expiry"),
  ]);

  if (!accessToken || !refreshToken) {
    throw new Error("Gmail not connected. Please connect your Gmail account first.");
  }

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: expiry ? Number(expiry) * 1000 : undefined,
  });

  // Auto-refresh: listen for new tokens
  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      await setSetting("google_access_token", tokens.access_token);
    }
    if (tokens.refresh_token) {
      await setSetting("google_refresh_token", tokens.refresh_token);
    }
    if (tokens.expiry_date) {
      await setSetting("google_token_expiry", String(Math.floor(tokens.expiry_date / 1000)));
    }
  });

  return oauth2Client;
}

function getGmailClient() {
  return getOAuth2Client().then((auth) => google.gmail({ version: "v1", auth }));
}

export async function getProfile() {
  const gmail = await getGmailClient();
  const res = await gmail.users.getProfile({ userId: "me" });
  return res.data;
}

export async function searchEmails(query?: string): Promise<string[]> {
  const gmail = await getGmailClient();
  const messageIds: string[] = [];
  let pageToken: string | undefined;

  const searchQuery = query ?? GMAIL_SEARCH_QUERY;

  do {
    const res = await gmail.users.messages.list({
      userId: "me",
      q: searchQuery,
      maxResults: 100,
      pageToken,
    });

    if (res.data.messages) {
      for (const msg of res.data.messages) {
        if (msg.id) messageIds.push(msg.id);
      }
    }
    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);

  return messageIds;
}

export async function fetchMessage(messageId: string): Promise<GmailMessage> {
  const gmail = await getGmailClient();
  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  const headers = res.data.payload?.headers ?? [];
  const getHeader = (name: string) =>
    headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";

  const body = extractBody(res.data.payload, "text/plain");
  const htmlBody = extractBody(res.data.payload, "text/html");

  return {
    id: res.data.id ?? messageId,
    threadId: res.data.threadId ?? "",
    historyId: res.data.historyId ?? "",
    internalDate: res.data.internalDate ?? "",
    subject: getHeader("Subject"),
    from: getHeader("From"),
    to: getHeader("To"),
    body,
    htmlBody,
  };
}

function extractBody(
  payload: { mimeType?: string | null; body?: { data?: string | null }; parts?: Array<typeof payload> } | undefined | null,
  mimeType: string
): string {
  if (!payload) return "";

  if (payload.mimeType === mimeType && payload.body?.data) {
    return Buffer.from(payload.body.data, "base64url").toString("utf-8");
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      const result = extractBody(part, mimeType);
      if (result) return result;
    }
  }

  return "";
}

export async function getHistoryMessages(startHistoryId: string): Promise<string[]> {
  const gmail = await getGmailClient();
  const messageIds: string[] = [];
  let pageToken: string | undefined;

  try {
    do {
      const res = await gmail.users.history.list({
        userId: "me",
        startHistoryId,
        historyTypes: ["messageAdded"],
        pageToken,
      });

      if (res.data.history) {
        for (const entry of res.data.history) {
          if (entry.messagesAdded) {
            for (const added of entry.messagesAdded) {
              if (added.message?.id) {
                messageIds.push(added.message.id);
              }
            }
          }
        }
      }
      pageToken = res.data.nextPageToken ?? undefined;
    } while (pageToken);
  } catch (error: unknown) {
    const err = error as { code?: number };
    // History ID expired (404) — caller should fall back to full search
    if (err.code === 404) return [];
    throw error;
  }

  return messageIds;
}

export async function getLastHistoryId(): Promise<string | null> {
  const state = await db.gmailSyncState.findUnique({
    where: { id: "singleton" },
  });
  return state?.lastHistoryId ?? null;
}
