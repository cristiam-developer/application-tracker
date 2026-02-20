import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { PendingReview } from "@/lib/gmail/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const settingKey = `pending_review_${key}`;

  const setting = await db.setting.findUnique({
    where: { key: settingKey },
  });

  if (!setting) {
    return NextResponse.json(
      { error: "Review not found" },
      { status: 404 }
    );
  }

  const body = (await request.json()) as {
    action: "approve" | "dismiss";
    overrides?: {
      companyName?: string;
      positionTitle?: string;
      platform?: string;
    };
  };

  if (body.action === "dismiss") {
    await db.setting.delete({ where: { key: settingKey } });
    return NextResponse.json({ success: true, action: "dismissed" });
  }

  if (body.action === "approve") {
    const review = JSON.parse(setting.value) as PendingReview;
    const overrides = body.overrides ?? {};

    // Create the application
    const application = await db.application.create({
      data: {
        companyName: overrides.companyName ?? review.parsed.companyName,
        positionTitle: overrides.positionTitle ?? review.parsed.positionTitle,
        status: review.parsed.status,
        platform: overrides.platform ?? review.parsed.platform,
        applicationDate: new Date(review.parsed.applicationDate),
        url: review.parsed.url,
        contactEmail: review.parsed.contactEmail,
        source: "gmail_sync",
        emailMessageId: review.messageId,
        statusHistory: {
          create: {
            fromStatus: "applied",
            toStatus: "applied",
            notes: `Imported from Gmail review (${review.parserName} parser, confidence: ${(review.confidence * 100).toFixed(0)}%)`,
          },
        },
      },
    });

    // Remove the review
    await db.setting.delete({ where: { key: settingKey } });

    // Update sync state counter
    await db.gmailSyncState.update({
      where: { id: "singleton" },
      data: { totalSynced: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      action: "approved",
      applicationId: application.id,
    });
  }

  return NextResponse.json(
    { error: "Invalid action. Use 'approve' or 'dismiss'" },
    { status: 400 }
  );
}
