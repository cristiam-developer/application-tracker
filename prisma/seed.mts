import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const mod = await import("../src/generated/prisma/client.ts");
const PrismaClient = mod.PrismaClient;

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.applicationTag.deleteMany();
  await prisma.statusChange.deleteMany();
  await prisma.application.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.setting.deleteMany();

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "Remote", color: "#22c55e" } }),
    prisma.tag.create({ data: { name: "Hybrid", color: "#f59e0b" } }),
    prisma.tag.create({ data: { name: "On-site", color: "#ef4444" } }),
    prisma.tag.create({ data: { name: "FAANG", color: "#8b5cf6" } }),
    prisma.tag.create({ data: { name: "Startup", color: "#06b6d4" } }),
    prisma.tag.create({ data: { name: "High Priority", color: "#f97316" } }),
  ]);

  // Create 15 sample applications
  const applications = [
    {
      companyName: "Google",
      positionTitle: "Senior Frontend Engineer",
      status: "interview",
      platform: "linkedin",
      applicationDate: new Date("2026-01-15"),
      url: "https://careers.google.com/jobs/123",
      salary: "$180,000 - $250,000",
      location: "Mountain View, CA",
      jobType: "full_time",
      notes:
        "Passed phone screen. Technical interview scheduled for next week.",
      source: "manual",
    },
    {
      companyName: "Microsoft",
      positionTitle: "Full Stack Developer",
      status: "applied",
      platform: "company_website",
      applicationDate: new Date("2026-02-10"),
      url: "https://careers.microsoft.com/jobs/456",
      salary: "$150,000 - $200,000",
      location: "Redmond, WA",
      jobType: "full_time",
      source: "manual",
    },
    {
      companyName: "Stripe",
      positionTitle: "Software Engineer, Payments",
      status: "phone_screen",
      platform: "greenhouse",
      applicationDate: new Date("2026-02-01"),
      url: "https://stripe.com/jobs/789",
      salary: "$170,000 - $220,000",
      location: "San Francisco, CA",
      jobType: "full_time",
      notes: "Recruiter call scheduled for Feb 25.",
      source: "manual",
    },
    {
      companyName: "Vercel",
      positionTitle: "Next.js Developer Advocate",
      status: "offer",
      platform: "lever",
      applicationDate: new Date("2025-12-20"),
      url: "https://vercel.com/careers/101",
      salary: "$160,000 - $190,000",
      location: "Remote",
      jobType: "full_time",
      notes: "Offer received! Deadline to respond: March 1.",
      source: "manual",
    },
    {
      companyName: "Amazon",
      positionTitle: "SDE II",
      status: "rejected",
      platform: "workday",
      applicationDate: new Date("2025-12-05"),
      url: "https://amazon.jobs/202",
      salary: "$140,000 - $185,000",
      location: "Seattle, WA",
      jobType: "full_time",
      notes:
        "Rejected after final round. Feedback: needed more system design depth.",
      source: "manual",
    },
    {
      companyName: "Spotify",
      positionTitle: "Backend Engineer",
      status: "applied",
      platform: "linkedin",
      applicationDate: new Date("2026-02-18"),
      url: "https://spotifyjobs.com/303",
      salary: "$155,000 - $195,000",
      location: "New York, NY",
      jobType: "full_time",
      source: "gmail_sync",
      emailMessageId: "msg_spotify_001",
    },
    {
      companyName: "Figma",
      positionTitle: "Frontend Engineer",
      status: "interview",
      platform: "greenhouse",
      applicationDate: new Date("2026-01-28"),
      url: "https://figma.com/careers/404",
      salary: "$165,000 - $210,000",
      location: "San Francisco, CA",
      jobType: "full_time",
      notes: "On-site interview Feb 27. Prepare portfolio review.",
      source: "manual",
    },
    {
      companyName: "Notion",
      positionTitle: "Product Engineer",
      status: "applied",
      platform: "lever",
      applicationDate: new Date("2026-02-14"),
      url: "https://notion.so/careers/505",
      salary: "$150,000 - $195,000",
      location: "San Francisco, CA",
      jobType: "full_time",
      source: "manual",
    },
    {
      companyName: "Linear",
      positionTitle: "Senior Software Engineer",
      status: "phone_screen",
      platform: "company_website",
      applicationDate: new Date("2026-02-05"),
      url: "https://linear.app/careers/606",
      salary: "$170,000 - $220,000",
      location: "Remote",
      jobType: "full_time",
      notes: "Completed initial call. Waiting for take-home assignment.",
      source: "manual",
    },
    {
      companyName: "Datadog",
      positionTitle: "Software Engineer, Observability",
      status: "withdrawn",
      platform: "indeed",
      applicationDate: new Date("2025-11-20"),
      url: "https://datadog.com/careers/707",
      salary: "$145,000 - $185,000",
      location: "New York, NY",
      jobType: "full_time",
      notes: "Withdrew after receiving offer from Vercel.",
      source: "manual",
    },
    {
      companyName: "Shopify",
      positionTitle: "React Developer",
      status: "applied",
      platform: "linkedin",
      applicationDate: new Date("2026-02-16"),
      url: "https://shopify.com/careers/808",
      salary: "$140,000 - $180,000",
      location: "Remote",
      jobType: "full_time",
      source: "gmail_sync",
      emailMessageId: "msg_shopify_001",
    },
    {
      companyName: "Supabase",
      positionTitle: "Full Stack Engineer",
      status: "applied",
      platform: "company_website",
      applicationDate: new Date("2026-02-12"),
      url: "https://supabase.com/careers/909",
      salary: "$130,000 - $170,000",
      location: "Remote",
      jobType: "full_time",
      source: "manual",
    },
    {
      companyName: "Netflix",
      positionTitle: "UI Engineer",
      status: "rejected",
      platform: "linkedin",
      applicationDate: new Date("2025-12-10"),
      url: "https://jobs.netflix.com/1010",
      salary: "$200,000 - $300,000",
      location: "Los Gatos, CA",
      jobType: "full_time",
      notes: "Did not pass coding assessment.",
      source: "manual",
    },
    {
      companyName: "Tailwind Labs",
      positionTitle: "Design Engineer",
      status: "interview",
      platform: "company_website",
      applicationDate: new Date("2026-01-22"),
      url: "https://tailwindcss.com/careers/1111",
      salary: "$150,000 - $190,000",
      location: "Remote",
      jobType: "full_time",
      notes: "Second round interview completed. Awaiting decision.",
      source: "manual",
    },
    {
      companyName: "TechStartup Inc.",
      positionTitle: "Founding Engineer",
      status: "accepted",
      platform: "other",
      applicationDate: new Date("2025-11-01"),
      url: "https://techstartup.com/careers/1212",
      salary: "$120,000 + 1.5% equity",
      location: "Austin, TX",
      jobType: "full_time",
      notes: "Accepted! Start date: March 15, 2026.",
      source: "manual",
    },
  ];

  for (const appData of applications) {
    const app = await prisma.application.create({ data: appData });

    // Create initial status change for each application
    await prisma.statusChange.create({
      data: {
        applicationId: app.id,
        fromStatus: "applied",
        toStatus: appData.status,
        changedAt: appData.applicationDate,
        notes:
          appData.status === "applied"
            ? "Application submitted"
            : `Status changed to ${appData.status}`,
      },
    });
  }

  // Assign tags to applications
  const allApps = await prisma.application.findMany();
  const remoteTag = tags.find((t) => t.name === "Remote")!;
  const faangTag = tags.find((t) => t.name === "FAANG")!;
  const startupTag = tags.find((t) => t.name === "Startup")!;
  const highPriorityTag = tags.find((t) => t.name === "High Priority")!;

  const remoteApps = allApps.filter((a) => a.location === "Remote");
  for (const app of remoteApps) {
    await prisma.applicationTag.create({
      data: { applicationId: app.id, tagId: remoteTag.id },
    });
  }

  const faangCompanies = ["Google", "Amazon", "Netflix", "Microsoft"];
  const faangApps = allApps.filter((a) =>
    faangCompanies.includes(a.companyName)
  );
  for (const app of faangApps) {
    await prisma.applicationTag.create({
      data: { applicationId: app.id, tagId: faangTag.id },
    });
  }

  const startupCompanies = ["Linear", "Supabase", "TechStartup Inc."];
  const startupApps = allApps.filter((a) =>
    startupCompanies.includes(a.companyName)
  );
  for (const app of startupApps) {
    await prisma.applicationTag.create({
      data: { applicationId: app.id, tagId: startupTag.id },
    });
  }

  const highPriorityCompanies = ["Vercel", "Google", "Stripe"];
  const hpApps = allApps.filter((a) =>
    highPriorityCompanies.includes(a.companyName)
  );
  for (const app of hpApps) {
    await prisma.applicationTag.create({
      data: { applicationId: app.id, tagId: highPriorityTag.id },
    });
  }

  // Create default settings
  await prisma.setting.createMany({
    data: [
      { key: "theme", value: "dark" },
      { key: "gmail_sync_enabled", value: "false" },
      { key: "gmail_scan_days", value: "90" },
    ],
  });

  // Initialize Gmail sync state singleton
  await prisma.gmailSyncState.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  console.log("Seeding complete!");
  console.log(`  - ${allApps.length} applications created`);
  console.log(`  - ${tags.length} tags created`);
  console.log(`  - 3 default settings created`);
  console.log(`  - Gmail sync state initialized`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
