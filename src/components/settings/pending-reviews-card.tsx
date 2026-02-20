"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Loader2, Inbox } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { PendingReview } from "@/lib/gmail/types";
import { PLATFORM_CONFIG } from "@/types";
import type { Platform } from "@/types";

type PendingReviewsCardProps = {
  refreshKey?: number;
};

export function PendingReviewsCard({ refreshKey }: PendingReviewsCardProps) {
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingKeys, setProcessingKeys] = useState<Set<string>>(new Set());

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/gmail/reviews");
      if (res.ok) {
        setReviews((await res.json()) as PendingReview[]);
      }
    } catch {
      // Silently fail on initial load
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, refreshKey]);

  async function handleAction(
    review: PendingReview,
    action: "approve" | "dismiss",
    overrides?: {
      companyName?: string;
      positionTitle?: string;
    }
  ) {
    setProcessingKeys((prev) => new Set(prev).add(review.messageId));

    try {
      const res = await fetch(`/api/gmail/reviews/${review.messageId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, overrides }),
      });

      if (!res.ok) throw new Error("Action failed");

      if (action === "approve") {
        toast.success(
          `Imported: ${overrides?.companyName ?? review.parsed.companyName} - ${overrides?.positionTitle ?? review.parsed.positionTitle}`
        );
      } else {
        toast.info("Review dismissed");
      }

      setReviews((prev) => prev.filter((r) => r.messageId !== review.messageId));
    } catch {
      toast.error("Failed to process review");
    } finally {
      setProcessingKeys((prev) => {
        const next = new Set(prev);
        next.delete(review.messageId);
        return next;
      });
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Reviews</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Inbox className="h-5 w-5" />
          Pending Reviews
          {reviews.length > 0 && (
            <Badge variant="secondary">{reviews.length}</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Low-confidence email parses that need your review before importing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No pending reviews
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewItem
                key={review.messageId}
                review={review}
                processing={processingKeys.has(review.messageId)}
                onAction={handleAction}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReviewItem({
  review,
  processing,
  onAction,
}: {
  review: PendingReview;
  processing: boolean;
  onAction: (
    review: PendingReview,
    action: "approve" | "dismiss",
    overrides?: { companyName?: string; positionTitle?: string }
  ) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [companyName, setCompanyName] = useState(review.parsed.companyName);
  const [positionTitle, setPositionTitle] = useState(review.parsed.positionTitle);

  const platformLabel =
    PLATFORM_CONFIG[review.parsed.platform as Platform]?.label ??
    review.parsed.platform;

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-sm font-medium truncate" title={review.subject}>
            {review.subject}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            From: {review.from}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(review.receivedAt), {
              addSuffix: true,
            })}
          </p>
        </div>
        <Badge variant="outline" className="shrink-0">
          {(review.confidence * 100).toFixed(0)}% confidence
        </Badge>
      </div>

      {editing ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label className="text-xs text-muted-foreground">Company</label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Position</label>
            <Input
              value={positionTitle}
              onChange={(e) => setPositionTitle(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
      ) : (
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Company:</span>{" "}
            <span className="font-medium">{review.parsed.companyName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Position:</span>{" "}
            <span className="font-medium">{review.parsed.positionTitle}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Platform:</span>{" "}
            <span>{platformLabel}</span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => {
            if (editing) {
              onAction(review, "approve", { companyName, positionTitle });
            } else {
              onAction(review, "approve");
            }
          }}
          disabled={processing}
        >
          {processing ? (
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          ) : (
            <CheckCircle className="mr-1 h-3 w-3" />
          )}
          {editing ? "Save & Import" : "Import"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setEditing(!editing)}
          disabled={processing}
        >
          {editing ? "Cancel Edit" : "Edit"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onAction(review, "dismiss")}
          disabled={processing}
        >
          <XCircle className="mr-1 h-3 w-3" />
          Dismiss
        </Button>
      </div>
    </div>
  );
}
