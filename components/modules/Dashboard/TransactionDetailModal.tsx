"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import {
  IconCalendar,
  IconCreditCard,
  IconHash,
  IconUser,
  IconShoppingCart,
  IconBuildingStore,
  IconCircleCheck,
  IconClock,
} from "@tabler/icons-react";

interface TransactionDetailModalProps {
  sale: any | null;
  open: boolean;
  onClose: () => void;
}

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
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium ${mono ? "font-mono" : ""} truncate`}>{value}</p>
      </div>
    </div>
  );
}

const PAYMENT_COLORS: Record<string, string> = {
  cash:     "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  qris:     "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
  card:     "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  transfer: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
};

export function TransactionDetailModal({ sale, open, onClose }: TransactionDetailModalProps) {
  if (!sale) return null;

  const methodKey = (sale.paymentMethod ?? "").toLowerCase();
  const methodClass = PAYMENT_COLORS[methodKey] ?? "bg-muted text-muted-foreground";
  const isSuccess = sale.status === "success";
  const items: any[] = sale.order?.items ?? sale.items ?? [];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header gradient banner */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <IconShoppingCart className="h-5 w-5 text-primary" />
              Transaction Detail
            </DialogTitle>
          </DialogHeader>

          {/* Amount hero */}
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Total Amount</p>
              <p className="text-3xl font-bold tabular-nums tracking-tight">
                {formatCurrency(sale.totalAmount)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Badge
                className={isSuccess ? "bg-emerald-500 text-white hover:bg-emerald-600" : ""}
                variant={isSuccess ? "default" : "secondary"}
              >
                {isSuccess ? (
                  <><IconCircleCheck className="mr-1 h-3 w-3" />{sale.status}</>
                ) : (
                  <><IconClock className="mr-1 h-3 w-3" />{sale.status}</>
                )}
              </Badge>
              <span className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize ${methodClass}`}>
                {sale.paymentMethod ?? "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Main details */}
          <div className="grid grid-cols-2 gap-3">
            <DetailRow
              icon={IconHash}
              label="Order ID"
              value={`#${String(sale.orderId ?? "—").slice(-8).toUpperCase()}`}
              mono
            />
            <DetailRow
              icon={IconCalendar}
              label="Date & Time"
              value={
                sale.paidAt
                  ? new Date(sale.paidAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"
              }
            />
            <DetailRow
              icon={IconUser}
              label="Customer"
              value={sale.customer?.name ?? "Guest"}
            />
            <DetailRow
              icon={IconCreditCard}
              label="Payment Method"
              value={<span className="capitalize">{sale.paymentMethod ?? "—"}</span>}
            />
            {sale.branch?.name && (
              <DetailRow
                icon={IconBuildingStore}
                label="Branch"
                value={sale.branch.name}
              />
            )}
          </div>

          <Separator />

          {/* Items */}
          {items.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <IconShoppingCart className="h-3.5 w-3.5" />
                Purchased Products ({items.length})
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 -mx-1 px-1">
                {items.map((item: any, i: number) => {
                  const productName = 
                    item.productVariant?.product?.name_product ?? 
                    item.productName ?? 
                    item.product?.name ?? 
                    item.name ?? 
                    `Product ${i + 1}`;
                  
                  return (
                    <div key={i} className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-3 py-2.5 border border-transparent hover:border-border transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-tight truncate">
                          {productName}
                          {item.productVariant?.name_variant && item.productVariant.name_variant !== "Default" && (
                            <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                              ({item.productVariant.name_variant})
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatCurrency(item.price ?? 0)} × {item.quantity ?? 1}
                        </p>
                      </div>
                      <span className="text-sm font-bold tabular-nums">
                        {formatCurrency((item.price ?? 0) * (item.quantity ?? 1))}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Financial summary */}
          <div className="rounded-2xl bg-muted/50 p-5 space-y-3 border shadow-inner">
            {sale.subtotal != null && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(sale.subtotal)}</span>
              </div>
            )}
            {sale.taxAmount != null && sale.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">{formatCurrency(sale.taxAmount)}</span>
              </div>
            )}
            {sale.discountAmount != null && sale.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-rose-600">
                <span>Discount</span>
                <span className="font-medium">-{formatCurrency(sale.discountAmount)}</span>
              </div>
            )}
            {sale.changeAmount != null && sale.changeAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Change</span>
                <span className="font-medium">{formatCurrency(sale.changeAmount)}</span>
              </div>
            )}
            <Separator className="opacity-50" />
            <div className="flex justify-between items-center pt-1">
              <span className="text-base font-bold">Total Paid</span>
              <span className="text-xl font-black text-primary tabular-nums">
                {formatCurrency(sale.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
