import { NextRequest, NextResponse } from "next/server";
import { saveJobSchema, listSavedJobsSchema } from "@/lib/validators";
import { getSavedJobs, saveJob } from "@/lib/queries/saved-jobs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const parsed = listSavedJobsSchema.safeParse({
      filter: searchParams.get("filter") || "all",
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await getSavedJobs(
      parsed.data.filter,
      parsed.data.page,
      parsed.data.limit
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("List saved jobs error:", error);
    return NextResponse.json(
      { error: "Failed to list saved jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = saveJobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const job = await saveJob(parsed.data);
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Save job error:", error);
    return NextResponse.json(
      { error: "Failed to save job" },
      { status: 500 }
    );
  }
}
