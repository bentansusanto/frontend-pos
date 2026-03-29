"use client";

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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useGetSalesReportQuery } from "@/store/services/sales-report.service";
import { useRefundOrderMutation } from "@/store/services/order.service";
import { getCookie } from "@/utils/cookies";
import { Eye, RotateCcw } from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { RefundReceiptModal } from "@/components/modules/POS/RefundReceiptModal";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const formatCurrency = (value?: number) => currencyFormatter.format(Number(value || 0));

export default function TransactionsPage() {
  const branchId = getCookie("pos_branch_id");
  const branchParams = branchId ? { branchId } : undefined;

  const { data: salesData, isLoading: isSalesLoading } = useGetSalesReportQuery(branchParams);
  const [refundOrder, { isLoading: isRefunding }] = useRefundOrderMutation();

  const [currentPage, setCurrentPage] = useState(1);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");

  const itemsPerPage = 6;

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
        items: sale.items || [],
        subtotal: sale.subtotal || 0,
        taxAmount: sale.taxAmount || 0,
        discountAmount: sale.discountAmount || 0,
        refundReason: sale.refundReason,
        refundedAt: sale.refundedAt,
        invoiceNumber: sale.invoiceNumber || sale.orderId
      }))
      .filter((sale: any) => {
        if (activeTab === "all") return true;
        return sale.status === activeTab;
      })
      .sort((a: any, b: any) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
  }, [salesData, activeTab]);

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

  const [isRefundReceiptOpen, setIsRefundReceiptOpen] = useState(false);
  const [latestRefundData, setLatestRefundData] = useState<any>(null);

  const handleRefund = async () => {
    if (!selectedOrderForRefund) return;

    try {
      const response = await refundOrder({
        id: selectedOrderForRefund.orderId,
        reason: refundReason || "Customer requested refund"
      }).unwrap();

      toast.success("Order refunded successfully");
      setIsRefundDialogOpen(false);
      
      // Show the refund receipt
      if (response?.data?.refund) {
        setLatestRefundData({
          order: selectedOrderForRefund,
          refund: response.data.refund
        });
        setIsRefundReceiptOpen(true);
      }
      
      setRefundReason("");
      setSelectedOrderForRefund(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to refund order");
    }
  };

  const handlePrintRefund = () => {
    const printContent = document.getElementById("receipt-print-refund");
    if (printContent) {
      const windowUrl = "about:blank";
      const uniqueName = new Date().getTime();
      const windowName = "Print" + uniqueName;
      const printWindow = window.open(windowUrl, windowName, "left=0,top=0,width=800,height=900");

      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Receipt</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @media print {
                  @page { 
                    margin: 5mm; 
                  }
                  body { 
                    margin: 0;
                    padding: 0;
                    background: white;
                  }
                  #receipt-print-refund {
                    display: block !important;
                    width: 80mm;
                    margin: 0 auto;
                    padding: 4mm;
                  }
                }
              </style>
            </head>
            <body class="bg-gray-100 min-h-screen flex justify-center py-10">
              <div class="bg-white shadow-none">
                ${printContent.innerHTML}
              </div>
              <script>
                window.onload = () => {
                  window.print();
                  window.close();
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const indexOfFirstItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-foreground text-2xl font-bold">Transaction History</h3>
        <p className="text-muted-foreground text-sm">View and manage past transactions.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>List of all completed transactions.</CardDescription>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="success">Success</TabsTrigger>
              <TabsTrigger value="refunded">Refunded</TabsTrigger>
            </TabsList>
          </Tabs>
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
                              ? new Date(row.paidAt).toLocaleDateString("en-US") +
                                " " +
                                new Date(row.paidAt).toLocaleTimeString("en-US")
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
                                       : row.status === "refunded"
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
                            <div className="flex justify-end gap-1">
                              {row.status === "refunded" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    setLatestRefundData({
                                      order: row,
                                      refund: {
                                        id: row.orderId,
                                        amount: row.amount,
                                        reason: row.refundReason,
                                        refundedAt: row.refundedAt,
                                        paymentMethod: row.paymentMethod,
                                        stripeRefundId: row.stripeRefundId
                                      }
                                    });
                                    setIsRefundReceiptOpen(true);
                                  }}>
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              )}
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
                                ? new Date(row.paidAt).toLocaleDateString("en-US") +
                                  " " +
                                  new Date(row.paidAt).toLocaleTimeString("en-US")
                                : "-"}
                                    </DialogDescription>
                                  </DialogHeader>
                                   <div className="mt-4 max-h-[60vh] overflow-y-auto">
                                     {row.status === "refunded" && (
                                       <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
                                         <div className="flex items-center gap-2 text-sm font-semibold text-red-800">
                                           <RotateCcw className="h-4 w-4" />
                                           Refund Information
                                         </div>
                                         <p className="mt-1 text-sm text-red-700">
                                           <span className="font-medium">Reason:</span>{" "}
                                           {row.refundReason || "No reason provided"}
                                         </p>
                                         {row.refundedAt && (
                                           <p className="text-xs text-red-600">
                                             Refunded on: {new Date(row.refundedAt).toLocaleString()}
                                           </p>
                                         )}
                                         {row.stripeRefundId && (
                                           <p className="mt-1 text-[10px] font-mono text-red-500 break-all">
                                             Stripe ID: {row.stripeRefundId}
                                           </p>
                                         )}
                                       </div>
                                     )}
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

                                   {row.status === "success" && (
                                     <div className="mt-6 flex justify-end border-t pt-4">
                                       <Button
                                         variant="destructive"
                                         className="gap-2"
                                         onClick={() => {
                                           setSelectedOrderForRefund(row);
                                           setIsRefundDialogOpen(true);
                                         }}>
                                         <RotateCcw className="h-4 w-4" />
                                         Refund Order
                                       </Button>
                                     </div>
                                   )}
                                 </DialogContent>
                              </Dialog>
                            </div>
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

      <AlertDialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <RotateCcw className="h-5 w-5" />
              Confirm Refund
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to refund this order? This action will return items to stock and
              revert any loyalty points earned. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="refund-reason">Reason for Refund</Label>
              <Input
                id="refund-reason"
                placeholder="e.g., Damaged item, Customer change of mind..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRefunding}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleRefund();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
              disabled={isRefunding}>
              {isRefunding ? "Processing..." : "Confirm Refund"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {latestRefundData && (
        <RefundReceiptModal
          isOpen={isRefundReceiptOpen}
          onClose={() => setIsRefundReceiptOpen(false)}
          order={latestRefundData.order}
          refund={latestRefundData.refund}
          onPrint={handlePrintRefund}
          branch={{ name: getCookie("pos_branch_name") }}
          cashierName={latestRefundData.refund?.cashierName || latestRefundData.order?.cashierName}
        />
      )}
    </div>
  );
}
