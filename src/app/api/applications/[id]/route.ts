import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getApplicationById } from "@/lib/queries/applications";
import { updateApplicationSchema } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const application = await getApplicationById(id);

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("GET /api/applications/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateApplicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await db.application.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const data = parsed.data;
    const result = await db.$transaction(async (tx) => {
      // If status changed, create audit record
      if (data.status && data.status !== existing.status) {
        await tx.statusChange.create({
          data: {
            applicationId: id,
            fromStatus: existing.status,
            toStatus: data.status,
          },
        });
      }

      return tx.application.update({
        where: { id },
        data: {
          ...data,
          url: data.url || null,
          contactEmail: data.contactEmail || null,
        },
        include: {
          statusHistory: { orderBy: { changedAt: "desc" } },
        },
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("PUT /api/applications/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.application.delete({ where: { id } });

    return NextResponse.json({ message: "Application deleted" });
  } catch (error) {
    // Prisma P2025: Record not found
    if (
      error instanceof Error &&
      "code" in error &&
      (error as Record<string, unknown>).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }
    console.error("DELETE /api/applications/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
