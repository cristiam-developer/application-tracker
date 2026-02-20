import { Suspense } from "react";
import { getApplicationStats } from "@/lib/queries/stats";
import { statsQuerySchema } from "@/lib/validators";
import { Skeleton } from "@/components/ui/skeleton";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { StatCards } from "@/components/dashboard/stat-cards";
import { ApplicationsTimelineChart } from "@/components/dashboard/applications-timeline-chart";
import { StatusDonutChart } from "@/components/dashboard/status-donut-chart";
import { TopCompaniesChart } from "@/components/dashboard/top-companies-chart";
import { PlatformBreakdownChart } from "@/components/dashboard/platform-breakdown-chart";
import { RecentApplicationsTable } from "@/components/dashboard/recent-applications-table";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await searchParams;

  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawParams)) {
    if (typeof value === "string") params[key] = value;
    else if (Array.isArray(value) && value[0]) params[key] = value[0];
  }

  const parsed = statsQuerySchema.safeParse(params);
  const { period } = parsed.success ? parsed.data : statsQuerySchema.parse({});

  const stats = await getApplicationStats(period);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your job application pipeline.
          </p>
        </div>
        <Suspense fallback={<Skeleton className="h-9 w-80" />}>
          <PeriodSelector />
        </Suspense>
      </div>

      <StatCards {...stats.summary} />

      <ApplicationsTimelineChart data={stats.timeline} />

      <div className="grid gap-4 md:grid-cols-2">
        <StatusDonutChart data={stats.byStatus} />
        <TopCompaniesChart data={stats.topCompanies} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PlatformBreakdownChart data={stats.byPlatform} />
        <RecentApplicationsTable data={stats.recentApplications} />
      </div>
    </div>
  );
}
