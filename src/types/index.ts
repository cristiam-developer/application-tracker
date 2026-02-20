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
