"use client";

import { Pie, PieChart, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { ApplicationStatus } from "@/types";

type StatusData = {
  status: ApplicationStatus;
  label: string;
  count: number;
  color: string;
};

type Props = { data: StatusData[] };

export function StatusDonutChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>By Status</CardTitle>
          <CardDescription>No application data for this period.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const chartConfig = Object.fromEntries(
    data.map((d) => [d.status, { label: d.label, color: d.color }])
  ) satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>By Status</CardTitle>
        <CardDescription>Application status distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto h-[300px] w-full">
          <PieChart accessibilityLayer>
            <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={entry.status} fill={entry.color} />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="status" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
