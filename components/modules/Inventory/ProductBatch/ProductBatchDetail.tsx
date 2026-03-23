"use client";

import React, { memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Package, 
  Receipt, 
  Tag, 
  Timer, 
  Truck, 
  XCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ProductBatchDetailProps {
  batch: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductBatchDetail = memo(({ batch, open, onOpenChange }: ProductBatchDetailProps) => {
  if (!batch && !open) return null;

  const getStatusBadge = (status: string, expiryDate?: string) => {
    const now = new Date();
    const expiry = expiryDate ? new Date(expiryDate) : null;
    
    if (status === "expired" || (expiry && expiry < now)) {
      return <Badge variant="destructive" className="gap-1.5 px-3 py-1"><XCircle className="size-3.5" /> Expired</Badge>;
    }
    
    if (expiry) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);
      if (expiry <= thirtyDaysFromNow) {
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1.5 px-3 py-1"><AlertCircle className="size-3.5" /> Expiring Soon</Badge>;
      }
    }

    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 px-3 py-1"><CheckCircle2 className="size-3.5" /> Active</Badge>;
      case "hold":
        return <Badge variant="secondary" className="gap-1.5 px-3 py-1"><Timer className="size-3.5" /> On Hold</Badge>;
      case "sold_out":
        return <Badge variant="outline" className="gap-1.5 px-3 py-1">Sold Out</Badge>;
      default:
        return <Badge variant="outline" className="px-3 py-1">{status}</Badge>;
    }
  };

  const currentBatch = batch || { id: '', batchNumber: '', costPrice: 0, currentQuantity: 0, initialQuantity: 0 };
  const totalValue = Number(currentBatch.costPrice || 0) * Number(currentBatch.currentQuantity || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-none bg-white rounded-3xl shadow-xl duration-200">
        <div className="bg-slate-900 p-8 text-white relative">
          <div className="absolute top-8 right-8 hidden sm:block">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">ID: {currentBatch.id?.substring(0, 8)}</span>
          </div>
          <div className="space-y-4">
            {getStatusBadge(currentBatch.status, currentBatch.expiryDate)}
            <div className="space-y-1">
              <DialogTitle className="text-3xl font-black tracking-tight">{currentBatch.batchNumber || "UNNAMED BATCH"}</DialogTitle>
              <DialogDescription className="text-sm font-medium flex items-center gap-1.5 text-slate-400">
                <Package className="size-3.5" /> {currentBatch.productVariant?.product?.name_product} - {currentBatch.productVariant?.name_variant}
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8 bg-white max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Stock</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900">{currentBatch.currentQuantity}</span>
                <span className="text-sm font-bold text-slate-400">/ {currentBatch.initialQuantity}</span>
              </div>
            </div>
            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Batch Value</span>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-primary/70">$</span>
                <span className="text-3xl font-black text-primary">{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Section: Financials */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <Receipt className="size-3.5" /> Financial Details
                </h4>
                <div className="space-y-3 px-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Unit Cost (Net)</span>
                    <span className="font-mono font-bold text-slate-900">$ {Number(currentBatch.costPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <Separator className="bg-slate-100" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Purchase Cost</span>
                    <span className="font-mono font-bold text-slate-900">$ {(Number(currentBatch.costPrice || 0) * Number(currentBatch.initialQuantity || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Section: Logistics */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <Truck className="size-3.5" /> Sourcing & Logistics
                </h4>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 size-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                      <Truck className="size-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Supplier</p>
                      <p className="text-sm font-bold text-slate-900">{currentBatch.supplier?.name || currentBatch.supplier?.name_supplier || "Unknown Supplier"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 size-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                      <Tag className="size-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Store Branch</p>
                      <p className="text-sm font-bold text-slate-900">{currentBatch.branch?.name || "Main Branch"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Section: Lifecycle */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <Calendar className="size-3.5" /> Lifecycle Timeline
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                       <Clock className="size-4 text-slate-400" />
                       <span className="text-xs font-bold text-slate-600">Received</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">{currentBatch.receivedDate ? format(new Date(currentBatch.receivedDate), "dd MMM yyyy") : "N/A"}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                       <Timer className="size-4 text-slate-400" />
                       <span className="text-xs font-bold text-slate-600">Manufactured</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">{currentBatch.manufacturingDate ? format(new Date(currentBatch.manufacturingDate), "dd MMM yyyy") : "N/A"}</span>
                  </div>

                  <div className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border",
                    new Date(currentBatch.expiryDate) < new Date() 
                      ? "bg-destructive/5 border-destructive/20 text-destructive" 
                      : "bg-slate-50 border-slate-100 text-slate-900"
                  )}>
                    <div className="flex items-center gap-2">
                       <Calendar className="size-4 opacity-70" />
                       <span className="text-xs font-bold opacity-70">Expiry Date</span>
                    </div>
                    <span className="text-sm font-black">{currentBatch.expiryDate ? format(new Date(currentBatch.expiryDate), "dd MMM yyyy") : "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Info Alert */}
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex gap-3 items-start h-fit mt-auto">
                 <Info className="size-4 text-blue-500 mt-0.5 shrink-0" />
                 <p className="text-[10px] font-bold text-blue-700 leading-relaxed uppercase tracking-wider">
                   Strict retail compliance. Records are audited for financial and lifecycle accuracy.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default ProductBatchDetail;
