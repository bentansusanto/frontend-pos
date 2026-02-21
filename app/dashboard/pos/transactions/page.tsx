"use client";

import { Eye } from "lucide-react";
import React, { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useGetSalesReportQuery } from "@/store/services/sales-report.service";
import { getCookie } from "@/utils/cookies";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

const formatCurrency = (value?: number) => currencyFormatter.format(Number(value || 0));

export default function TransactionsPage() {
  const branchId = getCookie("pos_branch_id");
  const branchParams = branchId ? { branchId } : undefined;

  const { data: salesData, isLoading: isSalesLoading } = useGetSalesReportQuery(branchParams);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const allTransactions = useMemo(() => {
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
        items: sale.items || []
      }))
      .sort((a: any, b: any) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
  }, [salesData]);

  const totalItems = allTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return allTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [allTransactions, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const indexOfFirstItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Transaction History</h3>
        <p className="text-sm text-slate-500">View and manage past transactions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>List of all completed transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          {isSalesLoading ? (
            <div className="text-muted-foreground text-sm">Loading transactions...</div>
          ) : (
            <div className="space-y-4">
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
                    {currentItems.length ? (
                      currentItems.map((row: any) => (
                        <TableRow key={row.paymentId}>
                          <TableCell className="font-medium">{row.paymentId}</TableCell>
                          <TableCell className="text-muted-foreground">{row.orderId}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {row.paidAt
                              ? new Date(row.paidAt).toLocaleDateString("id-ID") +
                                " " +
                                new Date(row.paidAt).toLocaleTimeString("id-ID")
                              : "-"}
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
                                      ? new Date(row.paidAt).toLocaleDateString("id-ID") +
                                        " " +
                                        new Date(row.paidAt).toLocaleTimeString("id-ID")
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
                                            {formatCurrency(
                                              (item.price || 0) * (item.quantity || 0)
                                            )}
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
                          No transactions found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Footer with Pagination */}
              {totalItems > 0 && (
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground text-sm">
                    Showing {indexOfFirstItem} to {indexOfLastItem} of {totalItems} entries
                  </div>

                  <Pagination className="mx-0 w-auto justify-end">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(currentPage - 1);
                          }}
                          className={
                            currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          return (
                            page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
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
                                  isActive={currentPage === page}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handlePageChange(page);
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
                            handlePageChange(currentPage + 1);
                          }}
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
