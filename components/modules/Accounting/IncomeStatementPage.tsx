"use client";

import { Button } from "@/components/ui/button";
import { BarChart3, TrendingDown, TrendingUp } from "lucide-react";
import { formatRupiah } from "@/utils/format-rupiah";

import { useAccountingDashboard } from "./hooks";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

function sumArray(arr: { name: string; amount: number }[]) {
  return arr.reduce((s, i) => s + i.amount, 0);
}

function StatRow({
  label,
  value,
  bold = false,
  indent = false,
  positive = true
}: {
  label: string;
  value: number;
  bold?: boolean;
  indent?: boolean;
  positive?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between border-b border-dashed py-2 last:border-0 ${indent ? "pl-4" : ""}`}>
      <span className={`text-sm ${bold ? "font-semibold" : "text-muted-foreground"}`}>{label}</span>
      <span
        className={`text-sm ${bold ? "font-bold" : "font-medium"} ${positive ? (value >= 0 ? "text-green-600" : "text-red-600") : "text-foreground"}`}>
        {positive && value < 0 ? `(${formatRupiah(-value)})` : formatRupiah(value)}
      </span>
    </div>
  );
}

export function IncomeStatementPage() {
  const { summary, incomeStatement, isLoading, dateRange } = useAccountingDashboard();

  const periodStr = dateRange.endDate
    ? format(dateRange.startDate!, "MMM yyyy") + " - " + format(dateRange.endDate, "MMM yyyy")
    : "Current";

  const mapAccount = (acc: any) => ({
    name: acc.accountName || acc.accountCode,
    amount: acc.balance || 0
  });

  const rawRevenues = incomeStatement?.revenues || [];
  const rawExpenses = incomeStatement?.expenses || [];

  // Categorize based on our COA structure or simply split COGS vs Opex if possible
  const revenueItems = rawRevenues.filter((a: any) => !a.accountCategory?.includes('OTHER')).map(mapAccount);
  const costOfRevenue = rawExpenses.filter((a: any) => a.accountCategory?.includes('COGS') || a.accountCategory?.includes('COST_OF')).map(mapAccount);
  const operatingExpenses = rawExpenses.filter((a: any) => !a.accountCategory?.includes('COGS') && !a.accountCategory?.includes('OTHER')).map(mapAccount);
  const otherExpenses = rawExpenses.filter((a: any) => a.accountCategory?.includes('OTHER')).map(mapAccount);

  const totalRevenue = sumArray(revenueItems);
  const totalCOGS = sumArray(costOfRevenue);
  const grossProfit = totalRevenue - totalCOGS;
  const grossMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  const totalOpex = sumArray(operatingExpenses);
  const operatingIncome = grossProfit - totalOpex;
  const operatingMargin = totalRevenue > 0 ? ((operatingIncome / totalRevenue) * 100).toFixed(1) : "0.0";

  const totalOtherExp = sumArray(otherExpenses);
  const netIncome = operatingIncome - totalOtherExp;
  const netMargin = totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : "0.0";

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
            <BarChart3 className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Income Statement</h1>
            <p className="text-muted-foreground text-sm">
              Profit & Loss for {periodStr}
            </p>
          </div>
        </div>
        <Button variant="outline">Export PDF</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Gross Profit",
            value: formatRupiah(grossProfit),
            sub: `${grossMargin}% margin`,
            color: "text-green-600",
            bg: "bg-green-50 dark:bg-green-950/20",
            icon: <TrendingUp className="h-4 w-4 text-green-600" />
          },
          {
            label: "Operating Income",
            value: formatRupiah(operatingIncome),
            sub: `${operatingMargin}% margin`,
            color: operatingIncome >= 0 ? "text-blue-600" : "text-red-600",
            bg: "bg-blue-50 dark:bg-blue-950/20",
            icon: <TrendingUp className="h-4 w-4 text-blue-600" />
          },
          {
            label: "Net Income",
            value: formatRupiah(netIncome),
            sub: `${netMargin}% net margin`,
            color: netIncome >= 0 ? "text-violet-600" : "text-red-600",
            bg: "bg-violet-50 dark:bg-violet-950/20",
            icon:
              netIncome >= 0 ? (
                <TrendingUp className="h-4 w-4 text-violet-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )
          }
        ].map((s) => (
          <div key={s.label} className={`bg-card rounded-xl border p-4 ${s.bg}`}>
            <div className="mb-1 flex items-center gap-1.5">
              {s.icon}
              <p className="text-muted-foreground text-xs">{s.label}</p>
            </div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-muted-foreground mt-1 text-xs">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Income Statement Detail */}
      <div className="bg-card rounded-xl border p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold">
          <BarChart3 className="h-4 w-4 text-violet-600" />
          Detailed Income Statement
        </h2>

        {/* Revenue */}
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold tracking-wider text-green-600 uppercase">
            Revenue
          </p>
          {revenueItems.map((r: any) => (
            <StatRow key={r.name} label={r.name} value={r.amount} indent positive={false} />
          ))}
          <div className="mt-2 flex items-center justify-between rounded-lg bg-green-500/10 px-4 py-2">
            <span className="text-sm font-bold">Total Revenue</span>
            <span className="font-bold text-green-600">{formatRupiah(totalRevenue)}</span>
          </div>
        </div>

        {/* COGS */}
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold tracking-wider text-orange-600 uppercase">
            Cost of Revenue
          </p>
          {costOfRevenue.map((r: any) => (
            <StatRow key={r.name} label={r.name} value={r.amount} indent positive={false} />
          ))}
          <div className="mt-2 flex items-center justify-between rounded-lg bg-orange-500/10 px-4 py-2">
            <span className="text-sm font-bold">Total COGS</span>
            <span className="font-bold text-orange-600">{formatRupiah(totalCOGS)}</span>
          </div>
        </div>

        {/* Gross Profit */}
        <div className="mb-4 flex items-center justify-between rounded-lg border border-green-200 bg-green-500/10 px-4 py-3 dark:border-green-800">
          <span className="font-bold">Gross Profit</span>
          <span className="text-lg font-bold text-green-600">{formatRupiah(grossProfit)}</span>
        </div>

        {/* Operating Expenses */}
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold tracking-wider text-red-600 uppercase">
            Operating Expenses
          </p>
          {operatingExpenses.map((r: any) => (
            <StatRow key={r.name} label={r.name} value={r.amount} indent positive={false} />
          ))}
          <div className="mt-2 flex items-center justify-between rounded-lg bg-red-500/10 px-4 py-2">
            <span className="text-sm font-bold">Total Operating Expenses</span>
            <span className="font-bold text-red-600">{formatRupiah(totalOpex)}</span>
          </div>
        </div>

        {/* Operating Income */}
        <div className="mb-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-500/10 px-4 py-3 dark:border-blue-800">
          <span className="font-bold">Operating Income (EBIT)</span>
          <span
            className={`text-lg font-bold ${operatingIncome >= 0 ? "text-blue-600" : "text-red-600"}`}>
            {formatRupiah(operatingIncome)}
          </span>
        </div>

        {/* Other Expenses */}
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold tracking-wider text-gray-600 uppercase">
            Other Expenses
          </p>
          {otherExpenses.map((r: any) => (
            <StatRow key={r.name} label={r.name} value={r.amount} indent positive={false} />
          ))}
        </div>

        {/* Net Income */}
        <div
          className={`flex items-center justify-between rounded-lg px-4 py-4 ${netIncome >= 0 ? "border border-violet-200 bg-violet-500/10 dark:border-violet-800" : "border border-red-200 bg-red-500/10 dark:border-red-800"}`}>
          <span className="text-base font-bold">NET INCOME</span>
          <span
            className={`text-xl font-bold ${netIncome >= 0 ? "text-violet-600" : "text-red-600"}`}>
            {formatRupiah(netIncome)}
          </span>
        </div>
      </div>
    </div>
  );
}
