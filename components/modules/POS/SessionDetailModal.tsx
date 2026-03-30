"use client";

import { useGetSessionSummaryQuery } from "@/store/services/pos-session.service";
import { format } from "date-fns";
import { 
  Building2, 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  Info, 
  Loader2,
  Receipt, 
  User as UserIcon,
  Wallet,
  Copy
} from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatUSD } from "@/utils/format-rupiah";

interface SessionDetailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string | null;
  userName: string;
  branchName: string;
}

export const SessionDetailModal = ({
  isOpen,
  onOpenChange,
  sessionId,
  userName,
  branchName
}: SessionDetailModalProps) => {
  const { data: summary, isLoading } = useGetSessionSummaryQuery(sessionId as string, {
    skip: !isOpen || !sessionId,
  });

  const isClosed = summary?.status === "closed";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] overflow-hidden p-0 gap-0 border-none shadow-2xl">
        {/* Header gradient banner matching TransactionDetailModal */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 pt-6 pb-4">
          <DialogHeader>
            <div className="flex items-center justify-between mb-3">
              <Badge className={cn(
                isClosed 
                  ? "bg-zinc-500/20 text-zinc-700 dark:text-zinc-300 border-zinc-500/30" 
                  : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
              )}>
                {summary?.status?.toUpperCase() || "LOADING"}
              </Badge>
            </div>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Receipt className="h-5 w-5 text-primary" />
              Session Summary
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1">
              Detailed financial and activity record for this shift.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">Retrieving financial data...</p>
            </div>
          ) : (
            <>
              {/* Financial Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-muted/30 p-4 rounded-2xl border shadow-sm transition-all hover:bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Wallet className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Opening</span>
                  </div>
                  <p className="text-xl font-bold tracking-tight">{formatUSD(summary?.openingBalance || 0)}</p>
                </div>
                
                <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 shadow-sm transition-all hover:bg-emerald-500/10">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Sales</span>
                  </div>
                  <p className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">+{formatUSD(summary?.totalSales || 0)}</p>
                </div>

                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 shadow-sm transition-all hover:bg-primary/10">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Receipt className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Expected</span>
                  </div>
                  <p className="text-xl font-bold tracking-tight text-primary">{formatUSD(summary?.expected_cash || 0)}</p>
                </div>
              </div>

              {/* Status Section */}
              {isClosed && (
                <div className={cn(
                  "p-4 rounded-2xl flex items-center justify-between border bg-muted/20 shadow-sm",
                  (summary?.difference || 0) < 0 
                    ? "border-red-500/20" 
                    : "border-blue-500/20"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-xl flex items-center justify-center shrink-0",
                      (summary?.difference || 0) < 0 
                        ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" 
                        : "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    )}>
                      <Info className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Cash Reconciliation</p>
                      <p className={cn(
                        "text-xs font-medium",
                        (summary?.difference || 0) < 0 ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"
                      )}>
                        Difference: {formatUSD(summary?.difference || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase font-bold tracking-tighter text-muted-foreground mb-0.5">Closing Balance</p>
                    <p className="text-xl font-bold tabular-nums tracking-tight text-foreground">{formatUSD(summary?.closingBalance || 0)}</p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Main Information Grid with clean DetailRow design pattern */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 px-1">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Cashier Staff</p>
                    <p className="text-sm font-medium truncate">{userName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Branch</p>
                    <p className="text-sm font-medium truncate">{branchName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Opened On</p>
                    <p className="text-sm font-medium truncate">
                      {summary?.startTime 
                        ? `${format(new Date(summary.startTime), "PP")} at ${format(new Date(summary.startTime), "HH:mm")}` 
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Closed On</p>
                    <p className="text-sm font-medium truncate">
                      {summary?.endTime 
                        ? `${format(new Date(summary.endTime), "PP")} at ${format(new Date(summary.endTime), "HH:mm")}` 
                        : "Currently Active"}
                    </p>
                  </div>
                </div>

                {sessionId && (
                   <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Session ID</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <code className="text-sm font-mono font-medium truncate text-foreground bg-muted/50 px-1 py-0.5 rounded">
                          {sessionId}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 hover:text-primary shrink-0"
                          onClick={() => {
                            navigator.clipboard.writeText(sessionId);
                            import("sonner").then((m) => m.toast.success("Session ID copied to clipboard"));
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {summary?.notes && (
                <div className="bg-muted/30 p-4 rounded-xl border border-dashed text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="font-semibold text-xs uppercase tracking-wider">Cashier Remarks</span>
                  </div>
                  <p className="italic text-muted-foreground">"{summary.notes}"</p>
                </div>
              )}

              <Separator className="opacity-60" />

              <div className="rounded-2xl bg-muted/40 p-5 border shadow-inner text-sm flex items-center justify-between">
                <div>
                  <span className="text-muted-foreground block mb-0.5">Transactions</span>
                  <span className="font-bold text-lg tabular-nums">{summary?.transactionsCount || 0}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground opacity-70">Source</span>
                  <p className="font-medium font-mono text-xs mt-1">POS Core System</p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
