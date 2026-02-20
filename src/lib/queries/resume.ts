import { db } from "@/lib/db";

export async function getActiveProfile() {
  return db.resumeProfile.findFirst({
    where: { isActive: true },
    orderBy: { uploadedAt: "desc" },
  });
}

export async function createProfile(data: {
  fileName: string;
  rawText: string;
  skills: string[];
  jobTitles: string[];
}) {
  // Deactivate all existing profiles first
  await deactivateAllProfiles();

  return db.resumeProfile.create({
    data: {
      fileName: data.fileName,
      rawText: data.rawText,
      skills: JSON.stringify(data.skills),
      jobTitles: JSON.stringify(data.jobTitles),
      isActive: true,
    },
  });
}

export async function deactivateAllProfiles() {
  await db.resumeProfile.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });
}

export async function getActiveSkills(): Promise<string[]> {
  const profile = await getActiveProfile();
  if (!profile?.skills) return [];
  try {
    return JSON.parse(profile.skills) as string[];
  } catch {
    return [];
  }
}
