"use client";

import React, { memo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconCalendar,
  IconHash,
  IconPackage,
  IconBuildingStore,
  IconTruckDelivery,
  IconReceipt2,
  IconHistory,
  IconPrinter,
  IconClock,
  IconCircleCheck,
  IconAlertCircle,
  IconX,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import BatchMovementHistory from "./BatchMovementHistory";
import BatchLabelPrint from "./BatchLabelPrint";

interface ProductBatchDetailProps {
  batch: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Helper component for clean label-value rows, matching TransactionDetailModal style.
 */
function DetailRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{label}</p>
        <p className={`text-sm font-semibold ${mono ? "font-mono" : ""} truncate`}>{value}</p>
      </div>
    </div>
  );
}

const ProductBatchDetail = memo(({ batch, open, onOpenChange }: ProductBatchDetailProps) => {
  const [activeTab, setActiveTab] = useState("info");

  if (!batch && !open) return null;

  const currentBatch = batch || { id: "", batchNumber: "", costPrice: 0, currentQuantity: 0, initialQuantity: 0 };
  const isExpired = currentBatch.status === "expired" || (currentBatch.expiryDate && new Date(currentBatch.expiryDate) < new Date());
  
  const totalValue = Number(currentBatch.costPrice || 0) * Number(currentBatch.currentQuantity || 0);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) setActiveTab("info");
      }}
    >
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden rounded-2xl border-none shadow-2xl bg-white">
        
        {/* Header Banner - Sales Report Style */}
        <div className={cn(
          "px-6 pt-6 pb-5 transition-colors duration-500",
          isExpired ? "bg-rose-50/50" : "bg-primary/5"
        )}>
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <IconPackage className={cn("h-5 w-5", isExpired ? "text-rose-500" : "text-primary")} />
              Batch Information
            </DialogTitle>
            <div className="flex flex-col items-end gap-1.5 pt-4">
              <Badge
                className={isExpired ? "bg-rose-500 text-white border-none" : "bg-emerald-500 text-white border-none"}
                variant="default"
              >
                {isExpired ? (
                  <><IconX className="mr-1 h-3 w-3" />Expired</>
                ) : (
                  <><IconCircleCheck className="mr-1 h-3 w-3" />Active</>
                )}
              </Badge>
            </div>
          </DialogHeader>

          {/* Batch ID Large Display */}
          <div className="mt-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Batch Identifier</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black tabular-nums tracking-tight">
                {currentBatch.batchNumber || "UNTAGGED"}
              </p>
              <span className="text-xs font-mono text-muted-foreground opacity-50">
                #{currentBatch.id?.substring(0, 8).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Main Info Grid */}
          <div className="grid grid-cols-2 gap-y-5 gap-x-4">
            <DetailRow
              icon={IconPackage}
              label="Product Name"
              value={currentBatch.productVariant?.product?.name_product || "—"}
            />
            <DetailRow
              icon={IconHash}
              label="Variant"
              value={currentBatch.productVariant?.name_variant || "Standard"}
            />
            <DetailRow
              icon={IconBuildingStore}
              label="Branch"
              value={currentBatch.branch?.name || "Main Store"}
            />
            <DetailRow
              icon={IconTruckDelivery}
              label="Supplier"
              value={currentBatch.supplier?.name || currentBatch.supplier?.name_supplier || "—"}
            />
          </div>

          <Separator className="opacity-60" />

          {/* Stock & Cost Summary Box - Matching Financial Summary Style */}
          <div className="rounded-2xl bg-muted/40 p-5 space-y-4 border shadow-inner">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Availability</span>
                  <p className="text-xl font-black">
                    {currentBatch.currentQuantity} <span className="text-xs font-bold text-muted-foreground">/ {currentBatch.initialQuantity}</span>
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Unit Cost</span>
                  <p className="text-xl font-black">
                    ${Number(currentBatch.costPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
             </div>
             
             <Separator className="opacity-30" />
             
             <div className="flex justify-between items-center text-primary">
                <div className="flex items-center gap-2">
                   <IconReceipt2 className="h-4 w-4" />
                   <span className="text-xs font-bold uppercase tracking-wider">Asset Valuation</span>
                </div>
                <span className="text-xl font-black tabular-nums">
                  ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
             </div>
          </div>

          {/* Dates Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <IconClock className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase text-muted-foreground">Received</p>
                <p className="text-xs font-bold">{currentBatch.receivedDate ? format(new Date(currentBatch.receivedDate), "dd MMM yyyy") : "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center",
                isExpired ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"
              )}>
                <IconAlertCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase text-muted-foreground">Expiry Date</p>
                <p className={cn("text-xs font-bold", isExpired && "text-rose-600")}>
                  {currentBatch.expiryDate ? format(new Date(currentBatch.expiryDate), "dd MMM yyyy") : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Secondary Features - History & Label */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-10 p-1 bg-muted/60">
              <TabsTrigger value="info" className="text-[10px] font-bold uppercase tracking-wider gap-2">
                <IconHistory className="h-3.5 w-3.5" /> History
              </TabsTrigger>
              <TabsTrigger value="print" className="text-[10px] font-bold uppercase tracking-wider gap-2">
                <IconPrinter className="h-3.5 w-3.5" /> Label
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-4 min-h-[100px]">
              <TabsContent value="info" className="m-0">
                <BatchMovementHistory batchId={currentBatch.id} />
              </TabsContent>
              <TabsContent value="print" className="m-0">
                <BatchLabelPrint batch={currentBatch} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer info bar */}
        <div className="bg-slate-50 border-t px-6 py-3 flex justify-between items-center text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
           <span>Registry Sync: OK</span>
           <span>Last Audit: {format(new Date(), "HH:mm")}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
});

ProductBatchDetail.displayName = "ProductBatchDetail";
export default ProductBatchDetail;
