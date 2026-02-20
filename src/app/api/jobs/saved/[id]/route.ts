import { NextResponse } from "next/server";
import { unsaveJob, markAsApplied } from "@/lib/queries/saved-jobs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await unsaveJob(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete saved job error:", error);
    return NextResponse.json(
      { error: "Failed to remove saved job" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const application = await markAsApplied(id);
    return NextResponse.json({
      success: true,
      applicationId: application.id,
    });
  } catch (error) {
    console.error("Mark as applied error:", error);
    return NextResponse.json(
      { error: "Failed to mark as applied" },
      { status: 500 }
    );
  }
}
