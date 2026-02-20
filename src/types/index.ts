export const APPLICATION_STATUSES = [
  "applied",
  "phone_screen",
  "interview",
  "offer",
  "rejected",
  "accepted",
  "withdrawn",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const PLATFORMS = [
  "linkedin",
  "indeed",
  "greenhouse",
  "lever",
  "workday",
  "company_website",
  "other",
] as const;

export type Platform = (typeof PLATFORMS)[number];

export const SOURCES = ["manual", "gmail_sync"] as const;

export type Source = (typeof SOURCES)[number];

export const JOB_TYPES = [
  "full_time",
  "part_time",
  "contract",
  "internship",
] as const;

export type JobType = (typeof JOB_TYPES)[number];

export const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string }
> = {
  applied: { label: "Applied", color: "bg-blue-500" },
  phone_screen: { label: "Phone Screen", color: "bg-yellow-500" },
  interview: { label: "Interview", color: "bg-purple-500" },
  offer: { label: "Offer", color: "bg-green-500" },
  rejected: { label: "Rejected", color: "bg-red-500" },
  accepted: { label: "Accepted", color: "bg-emerald-500" },
  withdrawn: { label: "Withdrawn", color: "bg-gray-500" },
};

export const PLATFORM_CONFIG: Record<Platform, { label: string }> = {
  linkedin: { label: "LinkedIn" },
  indeed: { label: "Indeed" },
  greenhouse: { label: "Greenhouse" },
  lever: { label: "Lever" },
  workday: { label: "Workday" },
  company_website: { label: "Company Website" },
  other: { label: "Other" },
};

export const ACTIVE_STATUSES = [
  "applied",
  "phone_screen",
  "interview",
  "offer",
] as const;

export const STATUS_CHART_COLORS: Record<ApplicationStatus, string> = {
  applied: "#3b82f6",
  phone_screen: "#eab308",
  interview: "#a855f7",
  offer: "#22c55e",
  rejected: "#ef4444",
  accepted: "#10b981",
  withdrawn: "#6b7280",
};

export const DASHBOARD_PERIODS = ["7d", "30d", "90d", "all"] as const;
export type DashboardPeriod = (typeof DASHBOARD_PERIODS)[number];

export const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
  all: "All time",
};

export type BoardApplication = {
  id: string;
  companyName: string;
  positionTitle: string;
  status: string;
  platform: string;
  applicationDate: string;
  location: string | null;
};

export const JOB_SOURCES = [
  "jsearch",
  "adzuna",
  "indeed",
  "glassdoor",
] as const;

export type JobSource = (typeof JOB_SOURCES)[number];

export const SOURCE_CONFIG: Record<
  JobSource,
  { label: string; color: string; bgColor: string }
> = {
  jsearch: {
    label: "JSearch",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
  },
  adzuna: {
    label: "Adzuna",
    color: "text-green-400",
    bgColor: "bg-green-500/20",
  },
  indeed: {
    label: "Indeed",
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
  },
  glassdoor: {
    label: "Glassdoor",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
  },
};

export type StatsResponse = {
  summary: {
    total: number;
    active: number;
    interviews: number;
    offers: number;
    responseRate: number;
  };
  byStatus: Array<{
    status: ApplicationStatus;
    label: string;
    count: number;
    color: string;
  }>;
  timeline: Array<{
    weekStart: string;
    count: number;
  }>;
  topCompanies: Array<{
    company: string;
    count: number;
  }>;
  byPlatform: Array<{
    platform: Platform;
    label: string;
    count: number;
  }>;
  recentApplications: Array<{
    id: string;
    companyName: string;
    positionTitle: string;
    status: string;
    applicationDate: string;
    platform: string;
  }>;
};
