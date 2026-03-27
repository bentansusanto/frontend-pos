"use client";

import React from "react";
import { format } from "date-fns";

interface ReceiptPrintProps {
  order: any;
  branch?: {
    name?: string;
    address?: string;
    phone?: string;
  };
  cashierName?: string;
}

export const ReceiptPrint = ({ order, branch, cashierName }: ReceiptPrintProps) => {
  if (!order) return null;

  const subtotal = Number(order.subtotal || 0);
  const taxAmount = Number(order.tax_amount || 0);
  const discountAmount = Number(order.discount_amount || 0);
  const totalAmount = Number(order.total_amount || 0);

  return (
    <div id="receipt-print" className="hidden print:block text-slate-900 font-mono text-[12px] leading-tight p-4 bg-white">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
            overflow: visible !important;
          }
          #receipt-print, #receipt-print * {
            visibility: visible;
          }
          #receipt-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            height: auto;
            background: white;
          }
          @page {
            margin: 0;
            size: auto;
          }
        }
      `}</style>
      
      {/* Header */}
      <div className="text-center space-y-1 mb-4">
        <h1 className="text-lg font-black uppercase tracking-widest">{branch?.name || "RETAIL POS"}</h1>
        {branch?.address && <p className="text-[10px] italic">{branch.address}</p>}
        {branch?.phone && <p className="text-[10px]">Tel: {branch.phone}</p>}
      </div>

      <div className="border-b border-dashed border-slate-400 my-2" />

      {/* Transaction Info */}
      <div className="space-y-1 text-[10px] mb-4">
        <div className="flex justify-between">
          <span>Order ID:</span>
          <span className="font-bold">#{order.id?.slice(-8).toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{format(new Date(), "dd/MM/yyyy HH:mm")}</span>
        </div>
        <div className="flex justify-between">
          <span>Cashier:</span>
          <span className="capitalize">{cashierName || "User"}</span>
        </div>
        {order.customer?.name && (
          <div className="flex justify-between">
            <span>Customer:</span>
            <span>{order.customer.name}</span>
          </div>
        )}
      </div>

      <div className="border-b border-dashed border-slate-400 my-2" />

      {/* Items List */}
      <div className="space-y-2 mb-4">
        {order.items?.map((item: any, idx: number) => (
          <div key={idx} className="space-y-0.5">
            <div className="flex justify-between font-bold">
              <span className="truncate flex-1 pr-2 uppercase">
                {item.product_name || "Item"}
                {item.variant_name && !item.variant_name.toLowerCase().includes("default") && ` - ${item.variant_name}`}
              </span>
              <span>${Number(item.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-600">
              <span className="italic pl-2">
                {item.qty} x ${Number(item.price || 0).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-b border-dashed border-slate-400 my-2" />

      {/* Totals */}
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>SUBTOTAL:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>TAX:</span>
          <span>${taxAmount.toFixed(2)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-slate-700">
            <span className="italic">DISCOUNT ({order.promotion?.name || "Promo"}):</span>
            <span>-${discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-black pt-2">
          <span>TOTAL:</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-b border-dashed border-slate-400 my-4" />

      {/* Footer */}
      <div className="text-center space-y-2">
        <p className="font-bold uppercase tracking-tight">Thank you for shopping!</p>
        <p className="text-[9px] text-slate-500 italic">Please keep this receipt for your records.</p>
        <div className="text-[10px] font-bold mt-4">
          *** PAID ***
        </div>
      </div>
    </div>
  );
};
