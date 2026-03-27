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
import { CheckCircle2, Printer, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { ReceiptPrint } from "./ReceiptPrint";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onPrint: () => void;
  branch?: any;
  cashierName?: string;
}

export const ReceiptModal = ({ isOpen, onClose, order, onPrint, branch, cashierName }: ReceiptModalProps) => {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-2 border-b text-center flex flex-col items-center">
          <div className="bg-green-100 text-green-600 p-3 rounded-full mb-2">
            <CheckCircle2 className="size-8" />
          </div>
          <DialogTitle className="text-xl">Payment Successful!</DialogTitle>
          <p className="text-sm text-muted-foreground">Order #{order.id}</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Order Items</h3>
            <div className="space-y-3">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">{item.qty}x</span>
                    <span>
                      {item.product_name || "Item"}
                      {item.variant_name && !item.variant_name.toLowerCase().includes("default") && ` - ${item.variant_name}`}
                    </span>
                  </div>
                  <span className="font-medium">${Number(item.subtotal || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${Number(order.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>${Number(order.tax_amount || 0).toFixed(2)}</span>
            </div>
            {Number(order.discount_amount || 0) > 0 && (
              <div className="flex justify-between items-center text-primary mt-1">
                <span>{order.promotion?.name || order.discount?.name || "Promotion"}</span>
                <span>-${Number(order.discount_amount).toFixed(2)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${Number(order.total_amount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-2 border-t flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={onPrint}>
            <Printer className="mr-2 size-4" />
            Print Receipt
          </Button>
          <Button className="flex-1" onClick={onClose}>
            <ArrowLeft className="mr-2 size-4" />
            Back to POS
          </Button>
        </DialogFooter>
        <ReceiptPrint order={order} branch={branch} cashierName={cashierName} />
      </DialogContent>
    </Dialog>
  );
};
