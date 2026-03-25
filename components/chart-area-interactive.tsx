"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";

const chartConfig = {
  sales: {
    label: "Sales",
    color: "var(--primary)"
  }
} satisfies ChartConfig;

type TimeRange = "weekly" | "monthly" | "yearly";

interface SalesChartProps {
  data: { date: string; sales: number }[];
}

function groupData(data: { date: string; sales: number }[], range: TimeRange) {
  if (range === "weekly") {
    // Group by week (Mon–Sun)
    const grouped: Record<string, number> = {};
    data.forEach(({ date, sales }) => {
      const d = new Date(date);
      const day = d.getDay(); // 0 = Sun
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      const key = monday.toISOString().split("T")[0];
      grouped[key] = (grouped[key] || 0) + sales;
    });
    return Object.entries(grouped)
      .map(([date, sales]) => ({ date, sales }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  if (range === "monthly") {
    const grouped: Record<string, number> = {};
    data.forEach(({ date, sales }) => {
      const key = date.slice(0, 7); // YYYY-MM
      grouped[key] = (grouped[key] || 0) + sales;
    });
    return Object.entries(grouped)
      .map(([date, sales]) => ({ date, sales }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // yearly
  const grouped: Record<string, number> = {};
  data.forEach(({ date, sales }) => {
    const key = date.slice(0, 4); // YYYY
    grouped[key] = (grouped[key] || 0) + sales;
  });
  return Object.entries(grouped)
    .map(([date, sales]) => ({ date, sales }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function formatLabel(value: string, range: TimeRange) {
  if (range === "weekly") {
    const date = new Date(value);
    return `Week of ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  }
  if (range === "monthly") {
    const [year, month] = value.split("-");
    return new Date(Number(year), Number(month) - 1).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric"
    });
  }
  return value;
}

export function ChartAreaInteractive({ data }: SalesChartProps) {
  const [range, setRange] = useState<TimeRange>("weekly");

  const chartData = useMemo(() => groupData(data, range), [data, range]);

  const tabs: { key: TimeRange; label: string }[] = [
    { key: "weekly", label: "Weekly" },
    { key: "monthly", label: "Monthly" },
    { key: "yearly", label: "Yearly" },
  ];

  return (
    <Card className="@container/card">
      <CardHeader className="flex flex-row items-start justify-between gap-2 flex-wrap">
        <div>
          <CardTitle>Sales Chart</CardTitle>
          <CardDescription className="mt-0.5">Sales performance over time</CardDescription>
        </div>
        {/* Period switcher */}
        <div className="flex rounded-lg border border-border bg-muted p-0.5 gap-0.5 self-start">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRange(tab.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                range === tab.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-2 sm:px-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickFormatter={(v) => formatLabel(v, range)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickFormatter={(v) => formatCurrency(v).replace(/\.00$/, "")}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(v) => formatLabel(v, range)}
                  formatter={(value) => [formatCurrency(Number(value)), "Sales"]}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="sales"
              type="natural"
              fill="url(#fillSales)"
              stroke="var(--primary)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
