"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DASHBOARD_PERIODS,
  PERIOD_LABELS,
  type DashboardPeriod,
} from "@/types";

export function PeriodSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPeriod = (searchParams.get("period") ?? "30d") as DashboardPeriod;

  function handlePeriodChange(period: DashboardPeriod) {
    const params = new URLSearchParams(searchParams.toString());
    if (period === "30d") {
      params.delete("period");
    } else {
      params.set("period", period);
    }
    const qs = params.toString();
    router.push(qs ? `/dashboard?${qs}` : "/dashboard");
  }

  return (
    <div className="flex items-center gap-1">
      {DASHBOARD_PERIODS.map((period) => (
        <Button
          key={period}
          variant={currentPeriod === period ? "default" : "outline"}
          size="sm"
          onClick={() => handlePeriodChange(period)}
        >
          {PERIOD_LABELS[period]}
        </Button>
      ))}
    </div>
  );
}
