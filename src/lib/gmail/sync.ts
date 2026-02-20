import { db } from "@/lib/db";
import { setSetting } from "@/lib/queries/settings";
import { searchEmails, fetchMessage, getHistoryMessages } from "./client";
import { parseEmail } from "./parser";
import type { SyncResult, PendingReview } from "./types";

const AUTO_IMPORT_THRESHOLD = 0.6;

export async function runSync(fullSync: boolean = false): Promise<SyncResult> {
  // Check if sync is already in progress
  const state = await db.gmailSyncState.findUnique({
    where: { id: "singleton" },
  });

  if (state?.syncInProgress) {
    throw new Error("Sync already in progress");
  }

  // Mark sync in progress
  await db.gmailSyncState.update({
    where: { id: "singleton" },
    data: { syncInProgress: true },
  });

  const result: SyncResult = {
    totalProcessed: 0,
    autoImported: 0,
    pendingReview: 0,
    skippedDuplicates: 0,
    errors: 0,
  };

  try {
    let messageIds: string[] = [];

    if (!fullSync && state?.lastHistoryId) {
      // Incremental sync via history API
      messageIds = await getHistoryMessages(state.lastHistoryId);

      // If history returned empty (expired), fall back to full search
      if (messageIds.length === 0) {
        messageIds = await searchEmails();
      }
    } else {
      // Full sync: search all matching emails
      messageIds = await searchEmails();
    }

    let latestHistoryId = state?.lastHistoryId ?? null;

    for (const messageId of messageIds) {
      try {
        // Check for duplicate by emailMessageId
        const existing = await db.application.findUnique({
          where: { emailMessageId: messageId },
          select: { id: true },
        });

        if (existing) {
          result.skippedDuplicates++;
          continue;
        }

        // Also check pending reviews
        const pendingKey = `pending_review_${messageId}`;
        const existingReview = await db.setting.findUnique({
          where: { key: pendingKey },
        });
        if (existingReview) {
          result.skippedDuplicates++;
          continue;
        }

        // Fetch full message
        const message = await fetchMessage(messageId);
        result.totalProcessed++;

        // Track latest historyId
        if (
          message.historyId &&
          (!latestHistoryId || BigInt(message.historyId) > BigInt(latestHistoryId))
        ) {
          latestHistoryId = message.historyId;
        }

        // Parse
        const parseResult = parseEmail(message);
        if (!parseResult) continue;

        if (parseResult.confidence >= AUTO_IMPORT_THRESHOLD) {
          // Auto-import
          await db.application.create({
            data: {
              companyName: parseResult.parsed.companyName,
              positionTitle: parseResult.parsed.positionTitle,
              status: parseResult.parsed.status,
              platform: parseResult.parsed.platform,
              applicationDate: parseResult.parsed.applicationDate,
              url: parseResult.parsed.url,
              contactEmail: parseResult.parsed.contactEmail,
              source: "gmail_sync",
              emailMessageId: messageId,
              statusHistory: {
                create: {
                  fromStatus: "applied",
                  toStatus: "applied",
                  notes: `Auto-imported from Gmail (${parseResult.parserName} parser, confidence: ${(parseResult.confidence * 100).toFixed(0)}%)`,
                },
              },
            },
          });
          result.autoImported++;
        } else {
          // Store as pending review
          const review: PendingReview = {
            key: pendingKey,
            messageId,
            subject: message.subject,
            from: message.from,
            receivedAt: new Date(Number(message.internalDate)).toISOString(),
            parsed: parseResult.parsed,
            confidence: parseResult.confidence,
            parserName: parseResult.parserName,
          };

          await setSetting(pendingKey, JSON.stringify(review));
          result.pendingReview++;
        }
      } catch (err) {
        console.error(`Error processing message ${messageId}:`, err);
        result.errors++;
      }
    }

    // Update sync state
    await db.gmailSyncState.update({
      where: { id: "singleton" },
      data: {
        lastSyncAt: new Date(),
        lastHistoryId: latestHistoryId,
        syncInProgress: false,
        totalSynced: { increment: result.autoImported },
      },
    });
  } catch (err) {
    // Ensure we clear syncInProgress on error
    await db.gmailSyncState.update({
      where: { id: "singleton" },
      data: { syncInProgress: false },
    });
    throw err;
  }

  return result;
}
