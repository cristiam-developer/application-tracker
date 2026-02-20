import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getApplications } from "@/lib/queries/applications";
import {
  createApplicationSchema,
  listApplicationsSchema,
} from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(
      request.nextUrl.searchParams.entries()
    );
    const parsed = listApplicationsSchema.safeParse(searchParams);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await getApplications(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/applications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createApplicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const application = await db.application.create({
      data: {
        ...data,
        url: data.url || null,
        contactEmail: data.contactEmail || null,
      },
    });

    // Create initial status change record
    await db.statusChange.create({
      data: {
        applicationId: application.id,
        fromStatus: "applied",
        toStatus: application.status,
        notes: "Application created",
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("POST /api/applications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
