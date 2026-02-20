import { db } from "@/lib/db";
import { subDays, startOfWeek, format } from "date-fns";
import {
  APPLICATION_STATUSES,
  ACTIVE_STATUSES,
  STATUS_CONFIG,
  STATUS_CHART_COLORS,
  PLATFORM_CONFIG,
  type ApplicationStatus,
  type Platform,
  type DashboardPeriod,
  type StatsResponse,
} from "@/types";

export async function getApplicationStats(
  period: DashboardPeriod
): Promise<StatsResponse> {
  const now = new Date();
  const periodDays: Record<DashboardPeriod, number | null> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    all: null,
  };
  const days = periodDays[period];
  const dateFrom = days ? subDays(now, days) : undefined;

  const where = dateFrom ? { applicationDate: { gte: dateFrom } } : {};

  const applications = await db.application.findMany({
    where,
    select: {
      id: true,
      companyName: true,
      positionTitle: true,
      status: true,
      platform: true,
      applicationDate: true,
    },
    orderBy: { applicationDate: "desc" },
  });

  // Summary
  const total = applications.length;
  const active = applications.filter((a) =>
    (ACTIVE_STATUSES as readonly string[]).includes(a.status)
  ).length;
  const interviews = applications.filter(
    (a) => a.status === "interview"
  ).length;
  const offers = applications.filter((a) => a.status === "offer").length;
  const responded = applications.filter(
    (a) => a.status !== "applied"
  ).length;
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

  // By status
  const statusCounts = new Map<string, number>();
  for (const app of applications) {
    statusCounts.set(app.status, (statusCounts.get(app.status) ?? 0) + 1);
  }
  const byStatus = APPLICATION_STATUSES.map((status) => ({
    status,
    label: STATUS_CONFIG[status].label,
    count: statusCounts.get(status) ?? 0,
    color: STATUS_CHART_COLORS[status],
  })).filter((s) => s.count > 0);

  // Weekly timeline
  const weekBuckets = new Map<string, number>();
  for (const app of applications) {
    const weekStart = startOfWeek(app.applicationDate, { weekStartsOn: 1 });
    const key = format(weekStart, "yyyy-MM-dd");
    weekBuckets.set(key, (weekBuckets.get(key) ?? 0) + 1);
  }
  const timeline = Array.from(weekBuckets.entries())
    .map(([weekStart, count]) => ({ weekStart, count }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));

  // Top companies
  const companyCounts = new Map<string, number>();
  for (const app of applications) {
    companyCounts.set(
      app.companyName,
      (companyCounts.get(app.companyName) ?? 0) + 1
    );
  }
  const topCompanies = Array.from(companyCounts.entries())
    .map(([company, count]) => ({ company, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Platform breakdown
  const platformCounts = new Map<string, number>();
  for (const app of applications) {
    platformCounts.set(
      app.platform,
      (platformCounts.get(app.platform) ?? 0) + 1
    );
  }
  const byPlatform = (Object.keys(PLATFORM_CONFIG) as Platform[])
    .map((p) => ({
      platform: p,
      label: PLATFORM_CONFIG[p].label,
      count: platformCounts.get(p) ?? 0,
    }))
    .filter((p) => p.count > 0)
    .sort((a, b) => b.count - a.count);

  // Recent applications
  const recentApplications = applications.slice(0, 5).map((app) => ({
    id: app.id,
    companyName: app.companyName,
    positionTitle: app.positionTitle,
    status: app.status,
    applicationDate: app.applicationDate.toISOString(),
    platform: app.platform,
  }));

  return {
    summary: { total, active, interviews, offers, responseRate },
    byStatus,
    timeline,
    topCompanies,
    byPlatform,
    recentApplications,
  };
}
