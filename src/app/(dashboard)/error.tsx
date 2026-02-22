"use client";

import { ErrorCard } from "@/components/ui/error-card";

export default function DashboardGroupError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorCard
      title="Something went wrong"
      description={error.message || "An unexpected error occurred."}
      onRetry={reset}
    />
  );
}
