"use client";

import { Button } from "@/components/ui/button";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { formatUSD } from "@/utils/format-rupiah";

import { useAccountingDashboard } from "./hooks";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

function sumArray(arr: { name: string; amount: number; type?: string }[]) {
  return arr.reduce((s, i) => s + i.amount, 0);
}

function CashflowSection({
  title,
  items,
  colorClass,
  borderColor
}: {
  title: string;
  items: { name: string; amount: number; type?: string }[];
  colorClass: string;
  borderColor: string;
}) {
  const net = sumArray(items);
  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className={`h-8 w-1 rounded-full ${borderColor}`} />
        <h2 className="text-base font-bold">{title}</h2>
      </div>
      <div className="space-y-0">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between border-b border-dashed py-2 last:border-0">
            <div className="flex items-center gap-2">
              {item.amount > 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className="text-muted-foreground text-sm">{item.name}</span>
            </div>
            <span
              className={`text-sm font-medium ${item.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatUSD(item.amount)}
            </span>
          </div>
        ))}
        <div
          className={`mt-3 flex items-center justify-between rounded-lg px-4 py-2 ${net >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
          <span className="text-sm font-semibold">Net Cash</span>
          <span className={`font-bold ${net >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatUSD(net)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function CashflowStatementPage() {
  const { summary, cashflow, isLoading, dateRange } = useAccountingDashboard();

  const periodStr = dateRange.endDate
    ? format(dateRange.startDate!, "MMM yyyy") + " - " + format(dateRange.endDate, "MMM yyyy")
    : "Current";

  const mapAccount = (acc: any) => ({
    name: acc.accountName || acc.accountCode,
    amount: acc.netCash,
    type: acc.netCash > 0 ? "inflow" : "outflow"
  });

  const rawOperating = cashflow?.operating || [];
  const rawInvesting = cashflow?.investing || [];
  const rawFinancing = cashflow?.financing || [];

  const operatingItems = rawOperating.map(mapAccount);
  const investingItems = rawInvesting.map(mapAccount);
  const financingItems = rawFinancing.map(mapAccount);

  // Hardcode opening balance for now, or assume 0 if not provided
  const openingBalance = 0; 
  
  const netOperating = summary.operatingCashflow;
  const netInvesting = cashflow?.netInvesting || 0;
  const netFinancing = cashflow?.netFinancing || 0;
  
  const netChange = summary.netCashflow;
  const closingBalance = openingBalance + netChange;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
            <Minus className="h-5 w-5 text-cyan-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cash Flow Statement</h1>
            <p className="text-muted-foreground text-sm">Cash movement for {periodStr}</p>
          </div>
        </div>
        <Button variant="outline">Export PDF</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Operating Activities",
            value: netOperating,
            color: netOperating >= 0 ? "text-green-600" : "text-red-600"
          },
          {
            label: "Investing Activities",
            value: netInvesting,
            color: netInvesting >= 0 ? "text-green-600" : "text-red-600"
          },
          {
            label: "Financing Activities",
            value: netFinancing,
            color: netFinancing >= 0 ? "text-green-600" : "text-red-600"
          },
          {
            label: "Net Change in Cash",
            value: netChange,
            color: netChange >= 0 ? "text-cyan-600" : "text-red-600"
          }
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border p-4 text-center">
            <p className={`text-lg font-bold ${s.color}`}>{formatUSD(s.value)}</p>
            <p className="text-muted-foreground mt-1 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="grid grid-cols-3 gap-4">
        <CashflowSection
          title="Operating Activities"
          items={operatingItems}
          colorClass="text-blue-600"
          borderColor="bg-blue-500"
        />
        <CashflowSection
          title="Investing Activities"
          items={investingItems}
          colorClass="text-purple-600"
          borderColor="bg-purple-500"
        />
        <CashflowSection
          title="Financing Activities"
          items={financingItems}
          colorClass="text-cyan-600"
          borderColor="bg-cyan-500"
        />
      </div>

      {/* Closing Balance */}
      <div className="bg-card rounded-xl border p-5">
        <h2 className="mb-4 text-base font-bold">Cash Position Summary</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b py-2">
            <span className="text-muted-foreground text-sm">Opening Cash Balance</span>
            <span className="font-medium">{formatUSD(openingBalance)}</span>
          </div>
          <div className="flex items-center justify-between border-b py-2">
            <span className="text-muted-foreground text-sm">Net Change in Cash</span>
            <span className={`font-medium ${netChange >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatUSD(netChange)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between rounded-lg bg-cyan-500/10 px-4 py-3">
            <span className="font-bold">Closing Cash Balance</span>
            <span className="text-lg font-bold text-cyan-600">{formatUSD(closingBalance)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
