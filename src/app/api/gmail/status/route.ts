import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [syncState, pendingCount] = await Promise.all([
    db.gmailSyncState.findUnique({ where: { id: "singleton" } }),
    db.setting.count({
      where: { key: { startsWith: "pending_review_" } },
    }),
  ]);

  return NextResponse.json({
    lastSyncAt: syncState?.lastSyncAt ?? null,
    syncInProgress: syncState?.syncInProgress ?? false,
    totalSynced: syncState?.totalSynced ?? 0,
    pendingReviewCount: pendingCount,
  });
}
