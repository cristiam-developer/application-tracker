import { z } from "zod";
import {
  APPLICATION_STATUSES,
  PLATFORMS,
  JOB_TYPES,
  DASHBOARD_PERIODS,
  JOB_SOURCES,
} from "@/types";

export const createApplicationSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(200),
  positionTitle: z.string().min(1, "Position title is required").max(200),
  status: z.enum(APPLICATION_STATUSES).default("applied"),
  platform: z.enum(PLATFORMS).default("other"),
  applicationDate: z.coerce.date().default(() => new Date()),
  url: z.string().url("Must be a valid URL").max(2000).or(z.literal("")).optional().nullable(),
  salary: z.string().max(100).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  jobType: z.enum(JOB_TYPES).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  contactName: z.string().max(200).optional().nullable(),
  contactEmail: z
    .string()
    .email("Must be a valid email")
    .max(200)
    .or(z.literal(""))
    .optional()
    .nullable(),
});

export const updateApplicationSchema = createApplicationSchema.partial();

export const listApplicationsSchema = z.object({
  status: z.enum(APPLICATION_STATUSES).optional(),
  search: z.string().max(200).optional(),
  sortBy: z
    .enum([
      "companyName",
      "positionTitle",
      "status",
      "platform",
      "applicationDate",
      "createdAt",
    ])
    .default("applicationDate"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export type CreateApplicationInput = z.input<typeof createApplicationSchema>;
export type CreateApplicationOutput = z.output<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type ListApplicationsParams = z.infer<typeof listApplicationsSchema>;

export const statsQuerySchema = z.object({
  period: z.enum(DASHBOARD_PERIODS).default("30d"),
});

export type StatsQueryParams = z.infer<typeof statsQuerySchema>;

export const searchJobsSchema = z.object({
  query: z.string().min(1, "Search query is required").max(200),
  location: z.string().max(200).optional(),
  sources: z
    .array(z.enum(JOB_SOURCES))
    .min(1, "At least one source is required")
    .default(["jsearch", "adzuna"]),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type SearchJobsParams = z.infer<typeof searchJobsSchema>;

export const saveJobSchema = z.object({
  title: z.string().min(1).max(200),
  company: z.string().min(1).max(200),
  location: z.string().max(200).optional().nullable(),
  salary: z.string().max(200).optional().nullable(),
  url: z.string().url().max(2000),
  source: z.enum(JOB_SOURCES),
  sourceId: z.string().max(200).optional().nullable(),
  description: z.string().max(10000).optional().nullable(),
});

export type SaveJobInput = z.infer<typeof saveJobSchema>;

export const listSavedJobsSchema = z.object({
  filter: z.enum(["all", "applied", "not_applied"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
