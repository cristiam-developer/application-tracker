import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { PendingReview } from "@/lib/gmail/types";

export async function GET() {
  const settings = await db.setting.findMany({
    where: { key: { startsWith: "pending_review_" } },
  });

  const reviews: PendingReview[] = [];

  for (const setting of settings) {
    try {
      const review = JSON.parse(setting.value) as PendingReview;
      reviews.push(review);
    } catch {
      // Skip malformed entries
    }
  }

  // Sort by receivedAt descending
  reviews.sort(
    (a, b) =>
      new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
  );

  return NextResponse.json(reviews);
}
