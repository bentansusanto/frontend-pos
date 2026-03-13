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
  Wallet
} from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/utils/format-rupiah";

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
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
          <DialogHeader className="text-left space-y-1">
            <div className="flex items-center justify-between">
              <Badge className={cn(
                "mb-2",
                isClosed 
                  ? "bg-zinc-500/20 text-zinc-300 border-zinc-500/30" 
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              )}>
                {summary?.status?.toUpperCase() || "LOADING"}
              </Badge>
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Receipt className="h-6 w-6 text-primary" />
              Session Summary
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Detailed financial and activity record for this shift.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6 bg-white dark:bg-slate-950">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">Retrieving financial data...</p>
            </div>
          ) : (
            <>
              {/* Financial Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                    <Wallet className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Opening</span>
                  </div>
                  <p className="text-xl font-bold">{formatRupiah(summary?.openingBalance || 0)}</p>
                </div>
                
                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Sales</span>
                  </div>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">+{formatRupiah(summary?.totalSales || 0)}</p>
                </div>

                <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-2xl border border-primary/10 dark:border-primary/20 transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Receipt className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Expected</span>
                  </div>
                  <p className="text-xl font-bold text-primary">{formatRupiah(summary?.expected_cash || 0)}</p>
                </div>
              </div>

              {/* Status Section */}
              {isClosed && (
                <div className={cn(
                  "p-4 rounded-xl flex items-center justify-between border",
                  (summary?.difference || 0) < 0 
                    ? "bg-red-50 border-red-100 text-red-900 dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-300" 
                    : "bg-blue-50 border-blue-100 text-blue-900 dark:bg-blue-900/10 dark:border-blue-900/30 dark:text-blue-300"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-full",
                      (summary?.difference || 0) < 0 ? "bg-red-200/50 dark:bg-red-900/30" : "bg-blue-200/50 dark:bg-blue-900/30"
                    )}>
                      <Info className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Cash Reconciliation</p>
                      <p className="text-xs opacity-80">Difference: {formatRupiah(summary?.difference || 0)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase font-bold tracking-tighter opacity-70 mb-0.5">Closing Balance</p>
                    <p className="text-lg font-black">{formatRupiah(summary?.closingBalance || 0)}</p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Responsible Details</h4>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                      <UserIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Cashier Staff</p>
                      <p className="text-sm font-bold">{userName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                      <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Branch Location</p>
                      <p className="text-sm font-bold">{branchName}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Session Timeline</h4>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
                      <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 font-medium">Opened On</p>
                      <p className="text-sm font-bold">{summary?.startTime ? format(new Date(summary.startTime), "PPP") : "-"}</p>
                      <p className="text-[10px] text-muted-foreground">at {summary?.startTime ? format(new Date(summary.startTime), "HH:mm:ss") : "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                      <Clock className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Closed On</p>
                      <p className="text-sm font-bold">{summary?.endTime ? format(new Date(summary.endTime), "PPP") : "Currently Active"}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {summary?.endTime ? `at ${format(new Date(summary.endTime), "HH:mm:ss")}` : "---"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {summary?.notes && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <FileText className="h-3 w-3" />
                    <span className="text-[10px] font-bold uppercase">Cashier Remarks</span>
                  </div>
                  <p className="text-xs italic text-slate-600 dark:text-slate-400">"{summary.notes}"</p>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                <span>Transactions Processed: {summary?.transactionsCount || 0}</span>
                <span>Generated by POS Core System</span>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
