"use client";

import { ErrorCard } from "@/components/ui/error-card";

export default function BoardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorCard
      title="Failed to load board"
      description={error.message || "Could not load the kanban board."}
      onRetry={reset}
    />
  );
}
