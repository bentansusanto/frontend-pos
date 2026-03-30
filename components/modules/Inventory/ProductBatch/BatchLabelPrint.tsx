"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";
import Barcode from "react-barcode";
import { cn } from "@/lib/utils";

interface BatchLabelPrintProps {
  batch: any;
}

/**
 * BatchLabelPrint — Optimized for physical label printing.
 * 
 * Fixes: White page issue during print by using visibility targeting 
 * instead of aggressive display:none on body children.
 */
export default function BatchLabelPrint({ batch }: BatchLabelPrintProps) {
  const handlePrint = () => {
    window.print();
  };

  if (!batch) return null;

  const productName = batch.productVariant?.product?.name_product || "Unknown Product";
  const variantName = batch.productVariant?.name_variant || "";
  const expiryFormatted = batch.expiryDate
    ? format(new Date(batch.expiryDate), "dd MMM yyyy")
    : "N/A";
  const batchCode = batch.batchNumber || batch.id || "UNKNOWN";

  return (
    <div className="space-y-4">
      {/* Print Trigger Button */}
      <Button onClick={handlePrint} variant="outline" className="w-full gap-2 shadow-sm border-primary/20 hover:bg-primary/5">
        <Printer className="h-4 w-4" />
        Print Batch Label
      </Button>

      {/* Styled Print Media CSS */}
      <style>{`
        @media print {
          /* Hide everything in the body by default */
          body * {
            visibility: hidden;
          }
          
          /* Show only the label area and its children */
          #batch-print-area, 
          #batch-print-area * {
            visibility: visible;
          }
          
          /* Position the label at the absolute top-left for the printer */
          #batch-print-area {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            margin: 0;
            padding: 20mm; /* Standard label breathing room */
            border: none !important;
            box-shadow: none !important;
          }

          /* Hide browser headers/footers if possible */
          @page {
            margin: 0;
          }
        }
      `}</style>

      {/* Label Preview Card (What you see is what you get) */}
      <div
        id="batch-print-area"
        className="mx-auto max-w-[300px] rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 text-center shadow-inner transition-all"
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
            Nexus Inventory
          </span>
          <div className="h-1 w-8 bg-primary/20 rounded-full" />
        </div>

        {/* Product Details - Compact & High Contrast */}
        <div className="mt-5 space-y-1">
          <p className="text-xl font-black text-slate-900 leading-tight">
            {productName}
          </p>
          {variantName && (
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              {variantName}
            </p>
          )}
        </div>

        {/* Barcode Section */}
        <div className="mt-6 flex justify-center p-2 bg-slate-50 rounded-xl border border-slate-100">
          <Barcode 
            value={batchCode} 
            width={1.2} 
            height={40} 
            fontSize={10}
            background="transparent"
            lineColor="#000000"
            margin={0}
          />
        </div>

        {/* Technical Metadata Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-left border-t border-slate-100 pt-5">
          <div className="space-y-0.5">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Batch Code</p>
            <p className="text-[11px] font-bold text-slate-800 font-mono truncate">{batchCode}</p>
          </div>
          <div className="space-y-0.5 text-right">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Unit Price</p>
            <p className="text-[11px] font-bold text-slate-800">
              ${Number(batch.costPrice || 0).toFixed(2)}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Expiry Date</p>
            <p className={cn(
              "text-[11px] font-bold",
              new Date(batch.expiryDate) < new Date() ? "text-red-600" : "text-slate-800"
            )}>
              {expiryFormatted}
            </p>
          </div>
          <div className="space-y-0.5 text-right">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Available</p>
            <p className="text-[11px] font-bold text-slate-800">{batch.currentQuantity} units</p>
          </div>
        </div>

        {/* Verification Mark */}
        <div className="mt-6 flex items-center justify-center gap-2 grayscale opacity-30">
           <div className="size-1 bg-slate-400 rounded-full" />
           <p className="text-[8px] font-bold italic text-slate-400">Authentic Batch Record</p>
           <div className="size-1 bg-slate-400 rounded-full" />
        </div>
      </div>

      <p className="text-center text-[10px] text-muted-foreground font-medium animate-pulse">
        Preview scaled for standard 3x2 label printers
      </p>
    </div>
  );
}
