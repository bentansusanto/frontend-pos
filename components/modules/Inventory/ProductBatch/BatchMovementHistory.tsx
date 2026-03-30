"use client";

import React from "react";
import { format } from "date-fns";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Package,
  PackageOpen,
  ShoppingCart,
  Truck,
  AlertTriangle,
  RotateCcw,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetBatchMovementsQuery } from "@/store/services/product-batch.service";
import { cn } from "@/lib/utils";

interface BatchMovementHistoryProps {
  batchId: string;
}

// Map each ReferenceType to a label, icon, and color for display
const MOVEMENT_TYPE_META: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  sale: { label: "Sale", icon: ShoppingCart, color: "text-red-500" },
  purchase: { label: "Purchase", icon: Truck, color: "text-blue-500" },
  adjust: { label: "Adjustment", icon: Package, color: "text-purple-500" },
  return_sale: { label: "Return (Sale)", icon: RotateCcw, color: "text-amber-500" },
  return_purchase: { label: "Return (Purchase)", icon: RotateCcw, color: "text-amber-500" },
  expired: { label: "Dispose / Write-off", icon: AlertTriangle, color: "text-destructive" },
  damage: { label: "Damage", icon: AlertTriangle, color: "text-orange-500" },
  opening_stock: { label: "Opening Stock", icon: PackageOpen, color: "text-emerald-500" },
  stock_take: { label: "Stock Take", icon: Package, color: "text-indigo-500" },
};

/**
 * BatchMovementHistory — displays a timeline of all stock movements linked to a specific batch.
 * Fetches movements from GET /product-batches/:id/movements.
 * Positive qty = stock IN, negative qty = stock OUT.
 */
export default function BatchMovementHistory({ batchId }: BatchMovementHistoryProps) {
  const { data: movements, isLoading, isError } = useGetBatchMovementsQuery(batchId, {
    skip: !batchId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading history...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-8 text-center text-sm text-destructive">
        Failed to load movement history.
      </div>
    );
  }

  if (!movements || movements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <Package className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">No movements recorded yet.</p>
        <p className="text-xs text-muted-foreground/70">
          Movements appear here when stock is sold, adjusted, or disposed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {movements.map((movement: any, index: number) => {
        const meta = MOVEMENT_TYPE_META[movement.referenceType] || {
          label: movement.referenceType,
          icon: HelpCircle,
          color: "text-slate-400",
        };

        const Icon = meta.icon;
        // Determine direction: positive qty = stock IN, negative = stock OUT
        const isIncoming = Number(movement.qty) > 0;
        const qtyDisplay = `${isIncoming ? "+" : ""}${movement.qty}`;

        return (
          <div
            key={movement.id || index}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4 transition-colors",
              isIncoming
                ? "border-emerald-100 bg-emerald-50/50"
                : "border-slate-100 bg-slate-50/50"
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                isIncoming ? "bg-emerald-100" : "bg-slate-100"
              )}
            >
              <Icon className={cn("h-4 w-4", meta.color)} />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">{meta.label}</p>
                {/* Qty badge */}
                <Badge
                  variant="outline"
                  className={cn(
                    "font-mono font-bold text-xs shrink-0",
                    isIncoming
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  )}
                >
                  {isIncoming ? (
                    <ArrowUpCircle className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDownCircle className="mr-1 h-3 w-3" />
                  )}
                  {qtyDisplay} units
                </Badge>
              </div>

              {/* Reason / reference */}
              {movement.reason && (
                <p className="mt-0.5 text-xs text-muted-foreground truncate">
                  {movement.reason}
                </p>
              )}

              {/* Date */}
              <p className="mt-1 text-[11px] text-muted-foreground/70">
                {movement.createdAt
                  ? format(new Date(movement.createdAt), "dd MMM yyyy, HH:mm")
                  : "—"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
