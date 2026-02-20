import { NextResponse } from "next/server";
import { getActiveProfile } from "@/lib/queries/resume";

export async function GET() {
  try {
    const profile = await getActiveProfile();

    if (!profile) {
      return NextResponse.json({ skills: [], jobTitles: [], profile: null });
    }

    const skills = profile.skills ? JSON.parse(profile.skills) : [];
    const jobTitles = profile.jobTitles ? JSON.parse(profile.jobTitles) : [];

    return NextResponse.json({
      skills,
      jobTitles,
      profile: {
        id: profile.id,
        fileName: profile.fileName,
        uploadedAt: profile.uploadedAt,
      },
    });
  } catch (error) {
    console.error("Resume skills error:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}
