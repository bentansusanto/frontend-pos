"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { RotateCcw, Printer, ArrowLeft, Info } from "lucide-react";
import { RefundReceiptPrint } from "./RefundReceiptPrint";

interface RefundReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  refund: {
    id: string;
    amount: number;
    reason: string;
    refundedAt: string | Date;
    paymentMethod: string;
    stripeRefundId?: string;
    cashierName?: string;
  };
  onPrint: () => void;
  branch?: any;
  cashierName?: string;
}

export const RefundReceiptModal = ({
  isOpen,
  onClose,
  order,
  refund,
  onPrint,
  branch,
  cashierName
}: RefundReceiptModalProps) => {
  if (!order || !refund) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden flex flex-col max-h-[90vh] border-red-200">
        <DialogHeader className="p-6 pb-2 border-b bg-red-50/50 text-center flex flex-col items-center">
          <div className="bg-red-100 text-red-600 p-3 rounded-full mb-2">
            <RotateCcw className="size-8" />
          </div>
          <DialogTitle className="text-xl font-bold text-red-900 text-center">Refund Successful!</DialogTitle>
          <p className="text-sm text-red-700/70">Receipt #{refund.id}</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="rounded-lg border border-red-100 bg-red-50/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-red-800">
              <Info className="size-4" />
              Refund Information
            </div>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <span className="text-muted-foreground">Reason:</span>
              <span className="text-right font-medium">{refund.reason || "Product Return"}</span>
              <span className="text-muted-foreground">Cashier:</span>
              <span className="text-right font-medium">{refund.cashierName || cashierName || "System"}</span>
              <span className="text-muted-foreground">Method:</span>
              <span className="text-right font-medium capitalize">{refund.paymentMethod?.replace("_", " ")}</span>
              {refund.stripeRefundId && (
                <>
                  <span className="text-muted-foreground">Stripe ID:</span>
                  <span className="text-right font-mono text-[10px] truncate ml-4" title={refund.stripeRefundId}>
                    {refund.stripeRefundId}
                  </span>
                </>
              )}
              <span className="text-muted-foreground">Date:</span>
              <span className="text-right font-medium">
                {new Date(refund.refundedAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Returned Items</h3>
            <div className="space-y-3">
              {order.items?.map((item: any, index: number) => (
                <div key={item.id || index} className="flex justify-between text-sm">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">{item.qty}x</span>
                    <span>
                      {item.product_name || item.productName || "Item"}
                      {item.variant_name && !item.variant_name.toLowerCase().includes("default") && ` - ${item.variant_name}`}
                    </span>
                  </div>
                  <span className="font-medium text-destructive">-${Number(item.subtotal || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-1 text-sm pt-2">
            <div className="flex justify-between font-bold text-lg text-red-600">
              <span>Amount Refunded</span>
              <span>-${Number(refund.amount || order.totalAmount || order.amount || 0).toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-4">
              Original Order: #{order.invoice_number || order.orderId || order.id}
            </p>
          </div>
        </div>

        <DialogFooter className="p-6 pt-2 border-t flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={onPrint}>
            <Printer className="mr-2 size-4" />
            Print Slip
          </Button>
          <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={onClose}>
            <ArrowLeft className="mr-2 size-4" />
            Close
          </Button>
        </DialogFooter>
        <RefundReceiptPrint order={order} refund={refund} branch={branch} cashierName={cashierName} />
      </DialogContent>
    </Dialog>
  );
};
