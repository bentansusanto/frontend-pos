"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { IconTrendingUp, IconReceipt2, IconCurrencyDollar } from "@tabler/icons-react";

interface BranchPerformanceChartProps {
  totalSales: number;
  totalTransactions: number;
  averageTransaction: number;
}

export function BranchPerformanceChart({
  totalSales,
  totalTransactions,
  averageTransaction,
}: BranchPerformanceChartProps) {
  const metrics = [
    {
      label: "Total Sales",
      value: formatCurrency(totalSales),
      rawValue: totalSales,
      icon: IconCurrencyDollar,
      iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      barColor: "bg-emerald-500",
      max: totalSales,
    },
    {
      label: "Avg Transaction",
      value: formatCurrency(averageTransaction),
      rawValue: averageTransaction,
      icon: IconReceipt2,
      iconBg: "bg-blue-100 dark:bg-blue-900/40",
      iconColor: "text-blue-600 dark:text-blue-400",
      barColor: "bg-blue-500",
      max: totalSales,
    },
    {
      label: "Transactions",
      value: totalTransactions.toLocaleString(),
      rawValue: totalTransactions,
      icon: IconTrendingUp,
      iconBg: "bg-violet-100 dark:bg-violet-900/40",
      iconColor: "text-violet-600 dark:text-violet-400",
      barColor: "bg-violet-500",
      max: totalTransactions,
    },
  ];

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Branch Performance</CardTitle>
        <CardDescription>Key metrics at a glance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          // Normalise bar width within the same set
          const pct =
            i === 2
              ? 100 // transactions always full (it's its own scale)
              : metric.max > 0
              ? Math.min((metric.rawValue / metric.max) * 100, 100)
              : 0;

          return (
            <div key={metric.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${metric.iconBg}`}>
                    <Icon className={`h-3.5 w-3.5 ${metric.iconColor}`} />
                  </div>
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                </div>
                <span className="text-sm font-semibold tabular-nums">{metric.value}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${metric.barColor} transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
