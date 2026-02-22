"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";

const chartConfig = {
  sales: {
    label: "Sales",
    color: "var(--primary)"
  }
} satisfies ChartConfig;

interface SalesChartProps {
  data: { date: string; sales: number }[];
}

export function ChartAreaInteractive({ data }: SalesChartProps) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Sales Chart</CardTitle>
        <CardDescription>Daily sales performance</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tick={{ fill: "var(--muted-foreground)" }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric"
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric"
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area dataKey="sales" type="natural" fill="url(#fillSales)" stroke="var(--primary)" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
