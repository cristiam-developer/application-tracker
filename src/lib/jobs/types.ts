import type { JobSource } from "@/types";

export interface SearchResult {
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
  url: string;
  source: JobSource;
  sourceId: string | null;
  description: string | null;
  postedAt: string | null;
}

export interface SearchParams {
  query: string;
  location?: string;
  sources: JobSource[];
  page: number;
  limit: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  sources: {
    source: JobSource;
    available: boolean;
    count: number;
  }[];
  cached: boolean;
}
