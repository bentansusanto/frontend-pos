"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";
import { formatUSD } from "@/utils/format-rupiah";

import { useAccountingDashboard } from "./hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

function sumArray(arr: { name: string; amount: number }[]) {
  return arr.reduce((s, i) => s + i.amount, 0);
}

function Section({
  title,
  items,
  accent
}: {
  title: string;
  items: { name: string; amount: number }[];
  accent: string;
}) {
  const total = sumArray(items);
  return (
    <div className="mb-2">
      <p className={`mb-1 text-xs font-semibold tracking-wider uppercase ${accent}`}>{title}</p>
      {items.map((item) => (
        <div
          key={item.name}
          className="flex items-center justify-between border-b border-dashed py-1.5 last:border-0">
          <span className="text-muted-foreground text-sm">{item.name}</span>
          <span className="text-sm font-medium">{formatUSD(item.amount)}</span>
        </div>
      ))}
      <div className="flex items-center justify-between pt-2">
        <span className="text-sm font-semibold">Subtotal</span>
        <span className={`text-sm font-bold ${accent}`}>{formatUSD(total)}</span>
      </div>
    </div>
  );
}

export function BalanceSheetPage() {
  const { summary, balanceSheet, isLoading, dateRange } = useAccountingDashboard();

  const periodStr = dateRange.endDate ? format(dateRange.endDate, "MMMM d, yyyy") : "Current";

  const totalAssets = summary.totalAssets;
  const totalLiabilities = summary.totalLiabilities;
  const totalEquity = summary.totalEquity;
  
  const totalLiabilitiesEquity = totalLiabilities + totalEquity;
  const isBalanced = Math.abs(totalAssets - totalLiabilitiesEquity) < 1;

  // Map backend raw data to UI shape
  const rawAssets = balanceSheet?.assets || [];
  const rawLiabilities = balanceSheet?.liabilities || [];
  const rawEquities = balanceSheet?.equities || [];

  const mapAccount = (acc: any) => ({ name: acc.accountName || acc.accountCode, amount: acc.balance });

  // For simplicity, we just categorize based on string matching "CURRENT"
  const currentAssets = rawAssets.filter((a: any) => !a.accountCategory?.includes('NON_CURRENT') && !a.accountCategory?.includes('FIXED')).map(mapAccount);
  const nonCurrentAssets = rawAssets.filter((a: any) => a.accountCategory?.includes('NON_CURRENT') || a.accountCategory?.includes('FIXED')).map(mapAccount);
  
  const currentLiabilities = rawLiabilities.filter((a: any) => !a.accountCategory?.includes('NON_CURRENT') && !a.accountCategory?.includes('LONG_TERM')).map(mapAccount);
  const nonCurrentLiabilities = rawLiabilities.filter((a: any) => a.accountCategory?.includes('NON_CURRENT') || a.accountCategory?.includes('LONG_TERM')).map(mapAccount);
  
  const equityItems = rawEquities.map(mapAccount);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 gap-6">
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
            <Scale className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Balance Sheet</h1>
            <p className="text-muted-foreground text-sm">
              Financial position as of {periodStr}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={isBalanced ? "default" : "destructive"}>
            {isBalanced ? "✓ Balanced" : "✗ Unbalanced"}
          </Badge>
          <Button variant="outline">Export PDF</Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Assets",
            value: formatUSD(totalAssets),
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-950/20"
          },
          {
            label: "Total Liabilities",
            value: formatUSD(totalLiabilities),
            color: "text-red-600",
            bg: "bg-red-50 dark:bg-red-950/20"
          },
          {
            label: "Total Equity",
            value: formatUSD(totalEquity),
            color: "text-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-950/20"
          }
        ].map((s) => (
          <div key={s.label} className={`bg-card rounded-xl border p-4 text-center ${s.bg}`}>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-muted-foreground mt-1 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Balance Sheet */}
      <div className="grid grid-cols-2 gap-6">
        {/* ASSETS */}
        <div className="bg-card rounded-xl border p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-8 w-1 rounded-full bg-blue-500" />
            <h2 className="text-base font-bold">Assets</h2>
          </div>
          <Section
            title="Current Assets"
            items={currentAssets}
            accent="text-blue-600"
          />
          <div className="my-3 border-t" />
          <Section
            title="Non-Current Assets"
            items={nonCurrentAssets}
            accent="text-blue-600"
          />
          <div className="mt-4 flex items-center justify-between rounded-lg bg-blue-500/10 px-4 py-2">
            <span className="font-bold">TOTAL ASSETS</span>
            <span className="font-bold text-blue-600">{formatUSD(totalAssets)}</span>
          </div>
        </div>

        {/* LIABILITIES + EQUITY */}
        <div className="bg-card rounded-xl border p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-8 w-1 rounded-full bg-red-500" />
            <h2 className="text-base font-bold">Liabilities & Equity</h2>
          </div>
          <Section
            title="Current Liabilities"
            items={currentLiabilities}
            accent="text-red-600"
          />
          <div className="my-3 border-t" />
          <Section
            title="Non-Current Liabilities"
            items={nonCurrentLiabilities}
            accent="text-red-600"
          />
          <div className="my-3 border-t" />
          <Section title="Equity" items={equityItems} accent="text-emerald-600" />
          <div className="mt-4 flex items-center justify-between rounded-lg bg-emerald-500/10 px-4 py-2">
            <span className="font-bold">TOTAL LIABILITIES & EQUITY</span>
            <span className="font-bold text-emerald-600">
              {formatUSD(totalLiabilitiesEquity)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
