"use client";

import { Banknote, CreditCard, Eye, Receipt, Wallet } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  useGetMonthlySalesReportQuery,
  useGetSalesReportQuery,
  useGetSalesSummaryQuery,
  useGetWeeklySalesReportQuery,
  useGetYearlySalesReportQuery
} from "@/store/services/sales-report.service";
import { getCookie } from "@/utils/cookies";
import { AiInsightSection } from "@/components/modules/AIInsights/AiInsightSection";
import { InsightType } from "@/types/ai-insight.type";

const chartConfig = {
  amount: {
    label: "Sales",
    color: "var(--primary)"
  }
} satisfies ChartConfig;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const formatCurrency = (value?: number) => currencyFormatter.format(Number(value || 0));

export default function SalesReportPage() {
  const branchId = getCookie("pos_branch_id");
  const branchParams = branchId ? { branchId } : undefined;

  const { data: summaryData, isLoading: isSummaryLoading } = useGetSalesSummaryQuery(branchParams);
  const { data: weeklyData, isLoading: isWeeklyLoading } =
    useGetWeeklySalesReportQuery(branchParams);
  const { data: monthlyData, isLoading: isMonthlyLoading } =
    useGetMonthlySalesReportQuery(branchParams);
  const { data: yearlyData, isLoading: isYearlyLoading } =
    useGetYearlySalesReportQuery(branchParams);
  const { data: salesData, isLoading: isSalesLoading } = useGetSalesReportQuery(branchParams);

  const weeklySeries = useMemo(() => {
    return Object.entries(weeklyData?.dailySales || {})
      .map(([date, amount]) => ({
        date,
        amount: Number(amount || 0)
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [weeklyData]);

  const monthlySeries = useMemo(() => {
    return Object.entries(monthlyData?.dailySales || {})
      .map(([date, amount]) => ({
        date,
        amount: Number(amount || 0)
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [monthlyData]);

  const yearlySeries = useMemo(() => {
    return Object.entries(yearlyData?.monthlySales || {})
      .map(([month, amount]) => ({
        month,
        amount: Number(amount || 0)
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [yearlyData]);

  const salesRows = useMemo(() => {
    return (salesData || [])
      .map((sale: any) => ({
        paymentId: sale.paymentId,
        orderId: sale.orderId,
        amount: sale.amount,
        paymentMethod: sale.paymentMethod,
        status: sale.status,
        paidAt: sale.paidAt,
        branchName: sale.branch?.name || "-",
        cashierName: sale.cashier?.name || "-",
        customerName: sale.customer?.name || "-",
        itemsCount: sale.items?.length || 0,
        items: sale.items || [],
        subtotal: sale.subtotal || 0,
        taxAmount: sale.taxAmount || 0,
        discountAmount: sale.discountAmount || 0
      }))
      .sort((a: any, b: any) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
  }, [salesData]);

  const totalReportSales = useMemo(() => {
    return salesRows.reduce((sum: number, row: any) => sum + Number(row.amount || 0), 0);
  }, [salesRows]);

  const paymentMethodSummary = summaryData?.paymentMethodSummary || {};
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const totalEntries = salesRows.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage !== currentPageSafe) {
      setCurrentPage(currentPageSafe);
    }
  }, [currentPage, currentPageSafe]);

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPageSafe - 1) * pageSize;
    return salesRows.slice(startIndex, startIndex + pageSize);
  }, [currentPageSafe, pageSize, salesRows]);

  const showingFrom = totalEntries === 0 ? 0 : (currentPageSafe - 1) * pageSize + 1;
  const showingTo = totalEntries === 0 ? 0 : Math.min(currentPageSafe * pageSize, totalEntries);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-foreground text-2xl font-bold">Sales Report</h3>
        <p className="text-muted-foreground text-sm">
          Monitor revenue performance and payment trends across periods.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Sales</CardDescription>
            <CardTitle className="text-xl">
              {isSummaryLoading ? "Loading..." : formatCurrency(summaryData?.totalSales)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs">
            {summaryData?.totalTransactions || 0} transaksi
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Transaction</CardDescription>
            <CardTitle className="text-xl">
              {isSummaryLoading ? "Loading..." : formatCurrency(summaryData?.averageTransaction)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs">
            Rata-rata per transaksi
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Payment Methods</CardDescription>
            <CardTitle className="text-xl">
              {Object.keys(paymentMethodSummary).length || 0} metode
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(paymentMethodSummary).length ? (
              Object.entries(paymentMethodSummary).map(([method, amount]) => (
                <Badge key={method} variant="secondary" className="text-xs">
                  {method}: {formatCurrency(Number(amount || 0))}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-xs">Belum ada data</span>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Transactions</CardDescription>
            <CardTitle className="text-xl">
              {isSummaryLoading ? "Loading..." : summaryData?.totalTransactions || 0}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs">
            Jumlah pembayaran sukses
          </CardContent>
        </Card>
      </div>

      <Card className="border-l-4 border-l-indigo-500 shadow-sm bg-linear-to-r from-indigo-50 to-white dark:from-indigo-950/20 dark:to-transparent">
        <CardContent className="py-4 px-6">
          <AiInsightSection 
            branchId={branchId || ""} 
            types={[InsightType.SALES_TREND, InsightType.BEST_SELLER, InsightType.REPORT_SUMMARY]} 
            title="AI Sales Analysis"
            limit={2}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="@container/card">
          <CardHeader>
            <CardTitle>Weekly Sales</CardTitle>
            <CardDescription>7 hari terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            {isWeeklyLoading ? (
              <div className="text-muted-foreground text-sm">Loading weekly chart...</div>
            ) : weeklySeries.length ? (
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <AreaChart data={weeklySeries}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    dataKey="amount"
                    type="monotone"
                    fill="var(--color-amount)"
                    fillOpacity={0.3}
                    stroke="var(--color-amount)"
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="text-muted-foreground text-sm">No data available.</div>
            )}
          </CardContent>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
            <CardDescription>30 hari terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            {isMonthlyLoading ? (
              <div className="text-muted-foreground text-sm">Loading monthly chart...</div>
            ) : monthlySeries.length ? (
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <AreaChart data={monthlySeries}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    dataKey="amount"
                    type="monotone"
                    fill="var(--color-amount)"
                    fillOpacity={0.3}
                    stroke="var(--color-amount)"
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="text-muted-foreground text-sm">No data available.</div>
            )}
          </CardContent>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardTitle>Yearly Sales</CardTitle>
            <CardDescription>12 bulan terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            {isYearlyLoading ? (
              <div className="text-muted-foreground text-sm">Loading yearly chart...</div>
            ) : yearlySeries.length ? (
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <BarChart data={yearlySeries}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="amount" fill="var(--color-amount)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="text-muted-foreground text-sm">No data available.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-none shadow-xl bg-background/50 backdrop-blur-xl">
        <CardHeader className="border-b bg-muted/20 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black">Sales Transactions</CardTitle>
              <CardDescription>Comprehensive log of completed business transactions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isSalesLoading ? (
            <div className="text-muted-foreground text-sm">Loading sales data...</div>
          ) : (
            <div className="overflow-auto rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment ID</TableHead>
                    <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order ID</TableHead>
                    <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</TableHead>
                    <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Amount</TableHead>
                    <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Method</TableHead>
                    <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</TableHead>
                    <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Branch</TableHead>
                    <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Staff</TableHead>
                    <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer</TableHead>
                    <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Items</TableHead>
                    <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRows.length ? (
                    paginatedRows.map((row: any) => (
                      <TableRow key={row.paymentId} className="group transition-colors hover:bg-muted/30">
                        <TableCell className="py-4 font-mono text-xs font-semibold text-primary">
                          {row.paymentId}
                        </TableCell>
                        <TableCell className="py-4 font-mono text-xs text-muted-foreground">
                          {row.orderId}
                        </TableCell>
                        <TableCell className="py-4 text-xs font-medium whitespace-nowrap">
                          {row.paidAt ? new Date(row.paidAt).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <span className="text-sm font-black text-foreground">
                            {formatCurrency(row.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge variant="outline" className="flex w-fit items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase transition-all group-hover:bg-background">
                            {row.paymentMethod === "cash" && <Banknote className="size-3 text-emerald-500" />}
                            {row.paymentMethod === "credit_card" && <CreditCard className="size-3 text-blue-500" />}
                            {row.paymentMethod === "stripe" && <Wallet className="size-3 text-indigo-500" />}
                            {row.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter ${
                              row.status === "success"
                                ? "bg-emerald-500/10 text-emerald-600 border-none shadow-none"
                                : row.status === "pending"
                                  ? "bg-amber-500/10 text-amber-600 border-none shadow-none"
                                  : "bg-rose-500/10 text-rose-600 border-none shadow-none"
                            }`}>
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-xs font-medium text-muted-foreground">{row.branchName}</TableCell>
                        <TableCell className="py-4 text-xs font-medium">{row.cashierName}</TableCell>
                        <TableCell className="py-4 text-xs text-muted-foreground">{row.customerName}</TableCell>
                        <TableCell className="py-4 text-right">
                          <span className="inline-flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-black">
                            {row.itemsCount}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Order Details</DialogTitle>
                                <DialogDescription>
                                  Order ID: {row.orderId} •{" "}
                                  {row.paidAt
                                    ? new Date(row.paidAt).toLocaleDateString("id-ID")
                                    : "-"}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="mt-4 max-h-[60vh] overflow-y-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Product</TableHead>
                                      <TableHead className="text-right">Qty</TableHead>
                                      <TableHead className="text-right">Price</TableHead>
                                      <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {row.items?.map((item: any, idx: number) => (
                                      <TableRow key={idx}>
                                        <TableCell>
                                          {item.productName || item.product?.name || "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {item.quantity}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {formatCurrency(item.price)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {formatCurrency((item.price || 0) * (item.quantity || 0))}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                    <TableRow>
                                      <TableCell
                                        colSpan={3}
                                        className="text-muted-foreground text-right">
                                        Subtotal
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {formatCurrency(row.subtotal)}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell
                                        colSpan={3}
                                        className="text-muted-foreground text-right">
                                        Tax Amount
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {formatCurrency(row.taxAmount)}
                                      </TableCell>
                                    </TableRow>
                                    {row.discountAmount > 0 && (
                                      <TableRow>
                                        <TableCell
                                          colSpan={3}
                                          className="text-destructive text-right">
                                          Discount
                                        </TableCell>
                                        <TableCell className="text-destructive text-right">
                                          -{formatCurrency(row.discountAmount)}
                                        </TableCell>
                                      </TableRow>
                                    )}
                                    <TableRow>
                                      <TableCell colSpan={3} className="text-right font-bold">
                                        Total Amount
                                      </TableCell>
                                      <TableCell className="text-right font-bold">
                                        {formatCurrency(row.amount)}
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="text-muted-foreground text-center">
                        No sales data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          
          <div className="p-6 pt-0">
            <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-muted/30 p-4 ring-1 ring-border/50">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Receipt className="size-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Summary</span>
                    <span className="text-sm font-bold text-foreground">Consolidated Transactions</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Total Revenue</span>
                  <span className="text-2xl font-black tracking-tight text-primary">{formatCurrency(totalReportSales)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                Showing <span className="text-foreground">{showingFrom}-{showingTo}</span> of <span className="text-foreground">{totalEntries}</span> records
              </div>
            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(Math.max(1, currentPageSafe - 1));
                    }}
                    className={
                      currentPageSafe === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    return (
                      page === 1 || page === totalPages || Math.abs(page - currentPageSafe) <= 1
                    );
                  })
                  .map((page, index, array) => {
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

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
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}>
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
                    className={
                      currentPageSafe === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}
