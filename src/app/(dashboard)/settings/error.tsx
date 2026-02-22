"use client";

import { ErrorCard } from "@/components/ui/error-card";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorCard
      title="Failed to load settings"
      description={error.message || "Could not load your settings."}
      onRetry={reset}
    />
  );
}
