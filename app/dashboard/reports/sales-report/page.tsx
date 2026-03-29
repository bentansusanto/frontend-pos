"use client";

import {
  Eye,
  Receipt,
  Wallet,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  ChevronDown,
  CalendarIcon,
  FileDown,
  Filter,
  Sparkles,
} from "lucide-react";
import { TransactionDetailModal } from "@/components/modules/Dashboard/TransactionDetailModal";
import React, { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  format,
  subDays,
  startOfMonth,
  startOfYesterday,
  endOfYesterday,
  startOfWeek,
  endOfWeek,
  startOfYear,
} from "date-fns";
import { DateRange } from "react-day-picker";
import {
  useGetMonthlySalesReportQuery,
  useGetSalesReportQuery,
  useGetSalesSummaryQuery,
  useGetWeeklySalesReportQuery,
  useGetYearlySalesReportQuery,
} from "@/store/services/sales-report.service";
import { getCookie } from "@/utils/cookies";
import { AiInsightSection } from "@/components/modules/AIInsights/AiInsightSection";
import { InsightType } from "@/types/ai-insight.type";
import axios from "axios";
import { toast } from "sonner";

const chartConfig = {
  amount: {
    label: "Sales",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatCurrency = (value?: number) =>
  currencyFormatter.format(Number(value || 0));

// ─── Stat card config ──────────────────────────────────────────────────────────
const PAYMENT_METHOD_COLORS: Record<string, string> = {
  cash:     "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  qris:     "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
  card:     "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  stripe:   "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  transfer: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
};

export default function SalesReportPage() {
  const branchId = getCookie("pos_branch_id");
  const branchParams = branchId ? { branchId } : undefined;

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const summaryParams = useMemo(() => ({
    ...branchParams,
    startDate: dateRange?.from?.toISOString(),
    endDate: dateRange?.to?.toISOString(),
  }), [branchParams, dateRange]);

  const { data: summaryData, isLoading: isSummaryLoading } =
    useGetSalesSummaryQuery(summaryParams);

  const { data: weeklyData } = useGetWeeklySalesReportQuery(branchParams);
  const { data: monthlyData } = useGetMonthlySalesReportQuery(branchParams);
  const { data: yearlyData } = useGetYearlySalesReportQuery(branchParams);
  const { data: salesData, isLoading: isSalesLoading } =
    useGetSalesReportQuery(branchParams);

  // ── Quick presets ────────────────────────────────────────────────────────────
  const applyPreset = (preset: "today" | "yesterday" | "week" | "month" | "year") => {
    const now = new Date();
    switch (preset) {
      case "today":       return setDateRange({ from: now, to: now });
      case "yesterday":   return setDateRange({ from: startOfYesterday(), to: endOfYesterday() });
      case "week":        return setDateRange({ from: startOfWeek(now), to: endOfWeek(now) });
      case "month":       return setDateRange({ from: startOfMonth(now), to: now });
      case "year":        return setDateRange({ from: startOfYear(now), to: now });
    }
  };

  // ── Chart series ────────────────────────────────────────────────────────────
  const weeklySeries = useMemo(() =>
    Object.entries(weeklyData?.dailySales || {})
      .map(([date, amount]) => ({ date, amount: Number(amount || 0) }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  [weeklyData]);

  const monthlySeries = useMemo(() =>
    Object.entries(monthlyData?.dailySales || {})
      .map(([date, amount]) => ({ date, amount: Number(amount || 0) }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  [monthlyData]);

  const yearlySeries = useMemo(() =>
    Object.entries(yearlyData?.monthlySales || {})
      .map(([month, amount]) => ({ month, amount: Number(amount || 0) }))
      .sort((a, b) => a.month.localeCompare(b.month)),
  [yearlyData]);

  // ── Export ──────────────────────────────────────────────────────────────────
  const handleExport = async (fmt: "excel" | "pdf") => {
    try {
      const params = new URLSearchParams();
      if (dateRange?.from) params.append("startDate", dateRange.from.toISOString());
      if (dateRange?.to)   params.append("endDate",   dateRange.to.toISOString());
      if (branchId)        params.append("branchId",  branchId);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.get(
        `${apiUrl}/sales-reports/export/${fmt}?${params.toString()}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${getCookie("pos_token")}`,
            "x-csrf-token": getCookie("pos_csrf_token") || "",
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sales-report.${fmt === "excel" ? "xlsx" : "pdf"}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Report exported to ${fmt.toUpperCase()}`);
    } catch {
      toast.error("Failed to export report");
    }
  };

  // ── Table data ───────────────────────────────────────────────────────────────
  const salesRows = useMemo(() =>
    (salesData || [])
      .map((sale: any) => ({
        paymentId:        sale.paymentId,
        orderId:          sale.orderId,
        amount:           sale.amount,
        paymentMethod:    sale.paymentMethod,
        status:           sale.status,
        paidAt:           sale.paidAt,
        branchName:       sale.branch?.name    || "-",
        cashierName:      sale.cashier?.name   || "-",
        customerName:     sale.customer?.name  || "-",
        itemsCount:       sale.items?.length   || 0,
        items:            sale.items           || [],
        subtotal:         sale.subtotal        || 0,
        taxAmount:        sale.taxAmount       || 0,
        discountAmount:   sale.discountAmount  || 0,
      }))
      .sort((a: any, b: any) =>
        new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
      ),
  [salesData]);

  const totalReportSales = useMemo(
    () => salesRows
      .filter((row: any) => row.status === "success")
      .reduce((sum: number, row: any) => sum + Number(row.amount || 0), 0),
    [salesRows]
  );

  const paymentMethodSummary = summaryData?.paymentMethodSummary || {};

  // ── Top selling products aggregation ────────────────────────────────────────
  const topProducts = useMemo(() => {
    if (!summaryData?.salesData) return [];
    
    const productMap: Record<string, { id: string; name: string; quantity: number; revenue: number }> = {};
    
    summaryData.salesData.forEach((sale: any) => {
      // already filtered by success/refunded status in backend summary potentially, 
      // but let's be double sure it's success
      if (sale.status !== "success") return;
      (sale.items || []).forEach((item: any) => {
        const id = item.productId || "unknown";
        if (!productMap[id]) {
          productMap[id] = { id, name: item.productName || "Unknown Product", quantity: 0, revenue: 0 };
        }
        productMap[id].quantity += Number(item.quantity || 0);
        productMap[id].revenue += Number(item.subtotal || 0);
      });
    });

    return Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [summaryData]);

  const maxQuantity = useMemo(() => 
    Math.max(...topProducts.map(p => p.quantity), 1)
  , [topProducts]);

  // ── Selected transaction for modal ───────────────────────────────────────────
  const [selectedSale, setSelectedSale] = useState<any | null>(null);

  // Map a table row to the shape TransactionDetailModal expects
  const toModalSale = (row: any) => ({
    ...row,
    totalAmount:    row.amount,
    customer:       { name: row.customerName },
    branch:         row.branchName !== "-" ? { name: row.branchName } : undefined,
    cashier:        { name: row.cashierName },
  });

  // ── Pagination ───────────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const totalEntries  = salesRows.length;
  const totalPages    = Math.max(1, Math.ceil(totalEntries / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage !== currentPageSafe) setCurrentPage(currentPageSafe);
  }, [currentPage, currentPageSafe]);

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPageSafe - 1) * pageSize;
    return salesRows.slice(startIndex, startIndex + pageSize);
  }, [currentPageSafe, pageSize, salesRows]);

  const showingFrom = totalEntries === 0 ? 0 : (currentPageSafe - 1) * pageSize + 1;
  const showingTo   = totalEntries === 0 ? 0 : Math.min(currentPageSafe * pageSize, totalEntries);

  // ── Date range display ───────────────────────────────────────────────────────
  const dateRangeLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, "MMM dd, y")} – ${format(dateRange.to, "MMM dd, y")}`
      : format(dateRange.from, "MMM dd, y")
    : "Select date range…";

  return (
    <div className="space-y-6 pb-6">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-bold tracking-tight">Sales Report</h3>
        <p className="text-sm text-muted-foreground">
          Monitor revenue performance and payment trends across periods.
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Sales */}
        <Card className="bg-gradient-to-br from-emerald-50/60 to-card dark:from-emerald-950/20 border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
              <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Revenue
            </span>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-xs text-muted-foreground mb-0.5">Total Sales</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight">
              {isSummaryLoading ? (
                <span className="animate-pulse text-muted-foreground/40">——</span>
              ) : (
                formatCurrency(summaryData?.totalSales)
              )}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {summaryData?.totalTransactions || 0} transactions
            </p>
          </CardContent>
        </Card>

        {/* Average Transaction */}
        <Card className="bg-gradient-to-br from-blue-50/60 to-card dark:from-blue-950/20 border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40">
              <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
              Per txn
            </span>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-xs text-muted-foreground mb-0.5">Avg Transaction</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight">
              {isSummaryLoading ? (
                <span className="animate-pulse text-muted-foreground/40">——</span>
              ) : (
                formatCurrency(summaryData?.averageTransaction)
              )}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Average per transaction</p>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="bg-gradient-to-br from-indigo-50/60 to-card dark:from-indigo-950/20 border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
              Unique
            </span>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-xs text-muted-foreground mb-0.5">Total Customers</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight">
              {isSummaryLoading ? (
                <span className="animate-pulse text-muted-foreground/40">——</span>
              ) : (
                (summaryData?.totalCustomers || 0).toLocaleString()
              )}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Customers who ordered</p>
          </CardContent>
        </Card>

        {/* Total Transactions */}
        <Card className="bg-gradient-to-br from-orange-50/60 to-card dark:from-orange-950/20 border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/40">
              <ShoppingCart className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Users className="h-3 w-3" /> Orders
            </span>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-xs text-muted-foreground mb-0.5">Total Transactions</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight">
              {isSummaryLoading ? (
                <span className="animate-pulse text-muted-foreground/40">——</span>
              ) : (
                (summaryData?.totalTransactions || 0).toLocaleString()
              )}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Successful payments</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Analysis & Trends Grid (3 Columns) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch lg:h-[480px] lg:overflow-hidden min-h-0">
        {/* ── Sales Trends Chart (Left & Wider) ── */}
        <Card className="overflow-hidden shadow-sm lg:col-span-2 h-full flex flex-col min-h-[400px] lg:max-h-[480px]">
          <Tabs defaultValue="weekly" className="w-full h-full flex flex-col">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Sales Trends</CardTitle>
                  <CardDescription className="text-xs">Sales visualization across different periods</CardDescription>
                </div>
                <TabsList className="bg-muted/60 p-0.5">
                  <TabsTrigger value="weekly"  className="text-xs px-3">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly" className="text-xs px-3">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly"  className="text-xs px-3">Yearly</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden h-full flex flex-col">
              {/* Weekly */}
              <TabsContent value="weekly" className="m-0 border-none p-0 flex-1 h-full">
                <div className="h-full w-full p-4">
                  <ChartContainer config={chartConfig} className="h-[320px] w-full">
                    <AreaChart data={weeklySeries}>
                      <defs>
                        <linearGradient id="gWeekly" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(v) => format(new Date(v), "dd MMM")}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fontSize: 11 }} 
                        tickFormatter={(v) => `$${v}`}
                        domain={[0, 'auto']}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent formatter={(v) => [formatCurrency(Number(v)), "Sales"]} />}
                      />
                      <Area dataKey="amount" type="monotone" fill="url(#gWeekly)" stroke="var(--primary)" strokeWidth={2} />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </TabsContent>

              {/* Monthly */}
              <TabsContent value="monthly" className="m-0 border-none p-0 flex-1 h-full">
                <div className="h-full w-full p-4">
                  <ChartContainer config={chartConfig} className="h-[320px] w-full">
                    <AreaChart data={monthlySeries}>
                      <defs>
                        <linearGradient id="gMonthly" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(v) => format(new Date(v), "dd MMM")}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fontSize: 11 }} 
                        tickFormatter={(v) => `$${v}`}
                        domain={[0, 'auto']}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent formatter={(v) => [formatCurrency(Number(v)), "Sales"]} />}
                      />
                      <Area dataKey="amount" type="monotone" fill="url(#gMonthly)" stroke="var(--primary)" strokeWidth={2} />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </TabsContent>

              {/* Yearly */}
              <TabsContent value="yearly" className="m-0 border-none p-0 flex-1 h-full">
                <div className="h-full w-full p-4">
                  <ChartContainer config={chartConfig} className="h-[320px] w-full">
                    <BarChart data={yearlySeries}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fontSize: 11 }} 
                        tickFormatter={(v) => `$${v}`}
                        domain={[0, 'auto']}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent formatter={(v) => [formatCurrency(Number(v)), "Sales"]} />}
                      />
                      <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                    </BarChart>
                  </ChartContainer>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* ── Right Column (AI + Top Products) ── */}
        <div className="lg:col-span-1 h-full flex flex-col gap-6 min-h-0 overflow-hidden">
          {/* ── AI Insight ── */}
          <Card className="shadow-sm h-fit overflow-hidden min-h-0">
            <CardHeader className="pb-3 border-b bg-muted/10">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col justify-start overflow-auto scrollbar-none">
              <AiInsightSection
                branchId={branchId || ""}
                types={[InsightType.SALES_TREND, InsightType.BEST_SELLER, InsightType.REPORT_SUMMARY]}
                hideTitle={true}
                limit={2}
              />
            </CardContent>
          </Card>

          {/* ── Top Selling Products ── */}
          <Card className="shadow-sm flex-1 overflow-hidden flex flex-col min-h-0">
            <CardHeader className="pb-3 border-b bg-muted/10">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                Top Selling Products
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-4 scrollbar-none">
              {isSummaryLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="h-10 w-10 rounded-lg bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-3/4 bg-muted rounded" />
                        <div className="h-2 w-1/2 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : topProducts.length > 0 ? (
                <div className="space-y-5">
                  {topProducts.map((product, idx) => (
                    <div key={product.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 max-w-[70%]">
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                            {idx + 1}
                          </span>
                          <span className="font-semibold truncate" title={product.name}>
                            {product.name}
                          </span>
                        </div>
                        <span className="font-bold tabular-nums">
                          {product.quantity} sold
                        </span>
                      </div>
                      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                        <div 
                          className="h-full bg-primary transition-all duration-500" 
                          style={{ width: `${(product.quantity / maxQuantity) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-end">
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {formatCurrency(product.revenue)} revenue
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                  <ShoppingCart className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-xs">No product data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Transactions table (Full Width) ── */}
      <Card className="overflow-hidden shadow-sm mt-12">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Recent Transactions</CardTitle>
              <CardDescription className="text-xs">Detailed log of all sales and refunds</CardDescription>
            </div>

            {/* toolbar moved hither */}
            <div className="flex flex-col gap-4 items-start sm:flex-row sm:items-center sm:justify-end w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal h-9",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs truncate">{dateRangeLabel}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <div className="flex gap-1.5 p-3 border-b flex-wrap">
                      {[
                        { key: "today",     label: "Today"      },
                        { key: "yesterday", label: "Yesterday"  },
                        { key: "week",      label: "This Week"  },
                        { key: "month",     label: "This Month" },
                        { key: "year",      label: "This Year"  },
                      ].map((p) => (
                        <button
                          key={p.key}
                          onClick={() => applyPreset(p.key as any)}
                          className="rounded-md border bg-muted px-2 py-0.5 text-[10px] font-medium hover:bg-accent transition-colors"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setDateRange({ from: subDays(new Date(), 30), to: new Date() })}
                  title="Reset to 30 days"
                >
                  <Filter className="h-3.5 w-3.5" />
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 h-9 text-xs">
                    <FileDown className="h-3.5 w-3.5" />
                    Export
                    <ChevronDown className="h-3 w-3 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="text-xs">Export Format</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs" onClick={() => handleExport("excel")}>
                    Export as Excel (.xlsx)
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs" onClick={() => handleExport("pdf")}>
                    Export as PDF (.pdf)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isSalesLoading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              Loading transactions…
            </div>
          ) : (
            <div className="overflow-auto text-sm">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    {["Order ID", "Date", "Amount", "Method", "Status", "Branch", "Staff", "Customer", "Items", ""].map(
                      (h) => (
                        <TableHead
                          key={h}
                          className="py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4"
                        >
                          {h}
                        </TableHead>
                      )
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRows.length ? (
                    paginatedRows.map((row: any) => {
                      const methodKey = (row.paymentMethod ?? "").toLowerCase();
                      const methodClass =
                        PAYMENT_METHOD_COLORS[methodKey] ?? "bg-muted text-muted-foreground";
                      return (
                        <TableRow key={row.paymentId} className="group hover:bg-muted/30 transition-colors border-b last:border-0 text-xs">
                          <TableCell className="py-3 font-mono text-[10px] text-muted-foreground px-4">
                            #{String(row.orderId ?? "—").slice(-8).toUpperCase()}
                          </TableCell>
                          <TableCell className="py-3 whitespace-nowrap px-4">
                            {row.paidAt
                              ? new Date(row.paidAt).toLocaleDateString("en-US", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-"}
                          </TableCell>
                          <TableCell className="py-3 font-bold tabular-nums text-right pr-6 px-4">
                            {formatCurrency(row.amount)}
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold capitalize ${methodClass}`}>
                              {row.paymentMethod ?? "—"}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <Badge
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight border-none",
                                row.status === "success"
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : row.status === "pending"
                                  ? "bg-amber-500/10 text-amber-600"
                                  : "bg-rose-500/10 text-rose-600"
                              )}
                            >
                              {row.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 text-muted-foreground px-4">{row.branchName}</TableCell>
                          <TableCell className="py-3 font-medium px-4">{row.cashierName}</TableCell>
                          <TableCell className="py-3 text-muted-foreground px-4">{row.customerName}</TableCell>
                          <TableCell className="py-3 text-center px-4">
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-black">
                              {row.itemsCount}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 text-right pr-4 px-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setSelectedSale(toModalSale(row))}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="py-12 text-center text-sm text-muted-foreground">
                        No sales data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Footer: summary + pagination */}
          <div className="space-y-4 p-6 pt-4 border-t">
            {/* Revenue summary bar */}
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 px-5 py-4 ring-1 ring-primary/20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Receipt className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Consolidated Total
                  </p>
                  <p className="text-sm font-bold">All filtered transactions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Total Sales</p>
                <p className="text-2xl font-black tracking-tight text-primary">
                  {formatCurrency(totalReportSales)}
                </p>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">{showingFrom}–{showingTo}</span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">{totalEntries}</span> records
              </p>
              <Pagination className="mx-0 w-auto justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(Math.max(1, currentPageSafe - 1));
                      }}
                      className={currentPageSafe === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPageSafe) <= 1)
                    .map((page, index, arr) => {
                      const showEllipsis = arr[index - 1] && page - arr[index - 1] > 1;
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              isActive={currentPageSafe === page}
                              onClick={(e) => { e.preventDefault(); setCurrentPage(page); }}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        </React.Fragment>
                      );
                    })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(Math.min(totalPages, currentPageSafe + 1));
                      }}
                      className={currentPageSafe === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </CardContent>
      </Card>

      <TransactionDetailModal
        sale={selectedSale}
        open={!!selectedSale}
        onClose={() => setSelectedSale(null)}
      />
    </div>
  );
}
