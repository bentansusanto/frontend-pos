"use client";

import { Eye } from "lucide-react";
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

const chartConfig = {
  amount: {
    label: "Sales",
    color: "var(--primary)"
  }
} satisfies ChartConfig;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
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
    return (salesData || []).map((sale: any) => ({
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
      items: sale.items || []
    }));
  }, [salesData]);

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

      <Card>
        <CardHeader>
          <CardTitle>Sales Transactions</CardTitle>
          <CardDescription>Daftar pembayaran sukses terbaru</CardDescription>
        </CardHeader>
        <CardContent>
          {isSalesLoading ? (
            <div className="text-muted-foreground text-sm">Loading sales data...</div>
          ) : (
            <div className="overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Cashier</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRows.length ? (
                    paginatedRows.map((row: any) => (
                      <TableRow key={row.paymentId}>
                        <TableCell className="font-medium">{row.paymentId}</TableCell>
                        <TableCell className="text-muted-foreground">{row.orderId}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {row.paidAt ? new Date(row.paidAt).toLocaleDateString("id-ID") : "-"}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(row.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {row.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-xs capitalize ${
                              row.status === "success"
                                ? "bg-green-600 hover:bg-green-700"
                                : row.status === "pending"
                                  ? "bg-yellow-600 hover:bg-yellow-700"
                                  : row.status === "failed"
                                    ? "bg-red-600 hover:bg-red-700"
                                    : ""
                            }`}>
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{row.branchName}</TableCell>
                        <TableCell>{row.cashierName}</TableCell>
                        <TableCell>{row.customerName}</TableCell>
                        <TableCell className="text-right">{row.itemsCount}</TableCell>
                        <TableCell className="text-right">
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
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-muted-foreground text-sm">
              Showing {showingFrom} to {showingTo} of {totalEntries} entries
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
        </CardContent>
      </Card>
    </div>
  );
}
