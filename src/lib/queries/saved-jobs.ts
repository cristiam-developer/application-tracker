import { db } from "@/lib/db";
import type { SaveJobInput } from "@/lib/validators";

export async function getSavedJobs(
  filter: "all" | "applied" | "not_applied" = "all",
  page = 1,
  limit = 20
) {
  const where =
    filter === "applied"
      ? { applied: true }
      : filter === "not_applied"
        ? { applied: false }
        : {};

  const [jobs, total] = await Promise.all([
    db.savedJob.findMany({
      where,
      orderBy: { savedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.savedJob.count({ where }),
  ]);

  return { jobs, total, page, limit };
}

export async function saveJob(data: SaveJobInput) {
  return db.savedJob.upsert({
    where: { url: data.url },
    create: {
      title: data.title,
      company: data.company,
      location: data.location,
      salary: data.salary,
      url: data.url,
      source: data.source,
      sourceId: data.sourceId,
      description: data.description,
    },
    update: {
      title: data.title,
      company: data.company,
      location: data.location,
      salary: data.salary,
      source: data.source,
      sourceId: data.sourceId,
      description: data.description,
    },
  });
}

export async function unsaveJob(id: string) {
  return db.savedJob.delete({ where: { id } });
}

export async function markAsApplied(id: string) {
  // Transaction: create Application + StatusChange, then mark SavedJob as applied
  return db.$transaction(async (tx) => {
    const savedJob = await tx.savedJob.findUniqueOrThrow({ where: { id } });

    const application = await tx.application.create({
      data: {
        companyName: savedJob.company,
        positionTitle: savedJob.title,
        status: "applied",
        platform: mapSourceToPlatform(savedJob.source),
        url: savedJob.url,
        salary: savedJob.salary,
        location: savedJob.location,
        notes: savedJob.description
          ? `Imported from saved job.\n\n${savedJob.description.slice(0, 1000)}`
          : "Imported from saved job.",
        source: "manual",
      },
    });

    await tx.statusChange.create({
      data: {
        applicationId: application.id,
        fromStatus: "applied",
        toStatus: "applied",
        notes: "Created from saved job",
      },
    });

    await tx.savedJob.update({
      where: { id },
      data: { applied: true },
    });

    return application;
  });
}

function mapSourceToPlatform(
  source: string
): string {
  switch (source) {
    case "indeed":
      return "indeed";
    case "jsearch":
    case "adzuna":
    case "glassdoor":
    default:
      return "other";
  }
}
