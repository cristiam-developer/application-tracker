import { NextRequest, NextResponse } from "next/server";
import { runSync } from "@/lib/gmail/sync";
import { getGmailConnectionStatus } from "@/lib/queries/settings";

export async function POST(request: NextRequest) {
  const status = await getGmailConnectionStatus();
  if (!status.connected) {
    return NextResponse.json(
      { error: "Gmail not connected" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const fullSync = (body as { fullSync?: boolean }).fullSync === true;
    const result = await runSync(fullSync);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    if (message === "Sync already in progress") {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    console.error("Gmail sync error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
