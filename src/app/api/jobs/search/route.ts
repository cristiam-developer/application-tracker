import { NextRequest, NextResponse } from "next/server";
import { searchJobsSchema } from "@/lib/validators";
import { searchJobs } from "@/lib/jobs/aggregator";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // Parse sources from comma-separated string
    const sourcesParam = searchParams.get("sources");
    const rawParams = {
      query: searchParams.get("query") || "",
      location: searchParams.get("location") || undefined,
      sources: sourcesParam ? sourcesParam.split(",") : undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
    };

    const parsed = searchJobsSchema.safeParse(rawParams);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const response = await searchJobs(parsed.data);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Job search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
