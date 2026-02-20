import { NextResponse } from "next/server";
import {
  getGmailConnectionStatus,
  disconnectGmail,
} from "@/lib/queries/settings";

export async function GET() {
  const status = await getGmailConnectionStatus();
  return NextResponse.json(status);
}

export async function DELETE() {
  await disconnectGmail();
  return NextResponse.json({ success: true });
}
