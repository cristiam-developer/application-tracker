"use client";

import { ErrorCard } from "@/components/ui/error-card";

export default function ApplicationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorCard
      title="Failed to load applications"
      description={error.message || "Could not load your applications."}
      onRetry={reset}
    />
  );
}
