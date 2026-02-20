import { NextResponse } from "next/server";
import { extractTextFromPdf } from "@/lib/resume/parser";
import { extractSkillsFromText } from "@/lib/resume/skills-extractor";
import { createProfile } from "@/lib/queries/resume";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are accepted" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File must be under 10MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rawText = await extractTextFromPdf(buffer);

    if (!rawText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from PDF" },
        { status: 400 }
      );
    }

    const { skills, jobTitles } = extractSkillsFromText(rawText);

    const profile = await createProfile({
      fileName: file.name,
      rawText,
      skills,
      jobTitles,
    });

    return NextResponse.json({
      id: profile.id,
      fileName: profile.fileName,
      skills,
      jobTitles,
      uploadedAt: profile.uploadedAt,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: "Failed to process resume" },
      { status: 500 }
    );
  }
}
