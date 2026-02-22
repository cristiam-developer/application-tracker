"use client";

import { ErrorCard } from "@/components/ui/error-card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorCard
      title="Failed to load dashboard"
      description={error.message || "Could not load your dashboard data."}
      onRetry={reset}
    />
  );
}
