"use client";

import * as React from "react";
import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const PAYMENT_COLORS: Record<string, string> = {
  cash:     "#10b981",
  qris:     "#6366f1",
  card:     "#f59e0b",
  stripe:   "#8b5cf6",
  transfer: "#3b82f6",
  unknown:  "#94a3b8",
};

const PAYMENT_LABELS: Record<string, string> = {
  cash:     "Cash",
  qris:     "QRIS",
  card:     "Card",
  stripe:   "Stripe",
  transfer: "Transfer",
  unknown:  "Other",
};

interface PaymentMethodChartProps {
  data: Record<string, number>;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-lg">
        <p className="font-medium capitalize">{PAYMENT_LABELS[name] ?? name}</p>
        <p className="text-muted-foreground">{formatCurrency(value)}</p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload, totalAmount }: { payload?: any[]; totalAmount: number }) => (
  <div className="mt-3 space-y-2">
    {(payload ?? []).map((entry: any) => {
      const pct = totalAmount > 0 ? ((entry.payload.value / totalAmount) * 100).toFixed(1) : "0.0";
      return (
        <div key={entry.value} className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: entry.color }} />
            <span className="truncate text-muted-foreground capitalize">
              {PAYMENT_LABELS[entry.value] ?? entry.value}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-medium tabular-nums">{formatCurrency(entry.payload.value)}</span>
            <span className="text-muted-foreground w-10 text-right">{pct}%</span>
          </div>
        </div>
      );
    })}
  </div>
);

export function PaymentMethodChart({ data }: PaymentMethodChartProps) {
  const chartData = React.useMemo(() => {
    return Object.entries(data)
      .filter(([, amount]) => amount > 0)
      .map(([method, amount]) => ({
        name: method.toLowerCase(),
        value: amount,
        fill: PAYMENT_COLORS[method.toLowerCase()] ?? PAYMENT_COLORS.unknown,
      }));
  }, [data]);

  const totalAmount = React.useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.value, 0),
    [chartData]
  );

  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center min-h-[280px]">
        <p className="text-sm text-muted-foreground">No payment data available.</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Revenue split by payment type</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <div className="mx-auto" style={{ width: "100%", height: 200 }}>
          <PieChart width={260} height={200} className="mx-auto">
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </div>
        {/* Center label overlay — shown below chart */}
        <p className="text-center text-xs text-muted-foreground -mt-2 mb-1">
          Total:{" "}
          <span className="font-semibold text-foreground">{formatCurrency(totalAmount)}</span>
        </p>
        <CustomLegend
          payload={chartData.map((d) => ({
            value: d.name,
            color: d.fill,
            payload: d,
          }))}
          totalAmount={totalAmount}
        />
      </CardContent>
    </Card>
  );
}
