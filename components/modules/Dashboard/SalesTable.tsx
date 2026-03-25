"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
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
import { formatCurrency } from "@/lib/utils";
import { IconExternalLink } from "@tabler/icons-react";
import { TransactionDetailModal } from "./TransactionDetailModal";

interface SalesTableProps {
  data: any[];
}

const paymentMethodColors: Record<string, string> = {
  cash:     "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  qris:     "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
  card:     "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  stripe:   "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  transfer: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
};

export function SalesTable({ data }: SalesTableProps) {
  const sortedData = [...data].sort((a, b) => {
    return new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime();
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const itemsPerPage = 8;

  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = sortedData.slice(startIndex, endIndex);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 py-4">
          <CardTitle className="text-base">Recent Sales Transactions</CardTitle>
          <span className="text-xs text-muted-foreground">{totalItems} total</span>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="pl-4">Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((sale) => {
                const methodKey = (sale.paymentMethod ?? "").toLowerCase();
                const methodClass = paymentMethodColors[methodKey] ?? "bg-muted text-muted-foreground";
                return (
                  <TableRow
                    key={sale.paymentId}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="pl-4 font-mono text-xs text-muted-foreground">
                      #{String(sale.orderId ?? "—").slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {sale.customer?.name ?? "Guest"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(sale.paidAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="font-semibold tabular-nums">
                      {formatCurrency(sale.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <span className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize ${methodClass}`}>
                        {sale.paymentMethod ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={sale.status === "success" ? "default" : "secondary"}
                        className={sale.status === "success" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}
                      >
                        {sale.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        onClick={() => setSelectedSale(sale)}
                      >
                        <IconExternalLink className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t px-4 py-3">
          <div className="text-muted-foreground text-xs">
            Showing {totalItems > 0 ? startIndex + 1 : 0}–{endIndex} of {totalItems} entries
          </div>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(p => p - 1); }}
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive onClick={(e) => e.preventDefault()}>
                  {currentPage}
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(p => p + 1); }}
                  aria-disabled={currentPage === totalPages}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        sale={selectedSale}
        open={!!selectedSale}
        onClose={() => setSelectedSale(null)}
      />
    </>
  );
}
