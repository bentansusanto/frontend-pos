"use client";

import { useFormik } from "formik";
import { toast } from "sonner";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  useCloseSessionMutation,
  useGetSessionSummaryQuery
} from "@/store/services/pos-session.service";
import { useGetReasonCategoriesQuery } from "@/store/services/reason-category.service";
import { Loader2, ClipboardList, Info, AlertTriangle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentDeclaration {
  method: string;
  declaredAmount: number | null;
}

interface CloseSessionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  onSuccess?: () => void;
}

const METHOD_LABELS: Record<string, string> = {
  cash: "💵 Cash",
  credit_card: "💳 Credit / Debit Card",
  stripe: "🏦 Stripe",
};

export const CloseSessionModal = ({
  isOpen,
  onOpenChange,
  sessionId,
  onSuccess
}: CloseSessionModalProps) => {
  const { data: summary, isLoading: isLoadingSummary } = useGetSessionSummaryQuery(sessionId, {
    skip: !isOpen || !sessionId,
    refetchOnMountOrArgChange: true
  });

  const [closeSession, { isLoading: isClosing }] = useCloseSessionMutation();

  // Initialize one input per payment method used in this session
  const [declarations, setDeclarations] = useState<PaymentDeclaration[]>([]);
  const [notes, setNotes] = useState("");
  const [reasonCategoryId, setReasonCategoryId] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: reasonCategories, isLoading: isLoadingReasons } = useGetReasonCategoriesQuery({ type: "pos_session" });

  useEffect(() => {
    // Methods to always show
    const requiredMethods = ["cash", "stripe"];
    const breakdown = summary?.paymentBreakdown || [];

    const initialDeclarations = requiredMethods.map((method) => {
      const systemTotal = breakdown.find((p: any) => p.method === method)?.total || 0;
      return {
        method,
        declaredAmount: systemTotal,
      };
    });

    // Add any other methods that might be in the breakdown but not in requiredMethods
    breakdown.forEach((p: any) => {
      if (!requiredMethods.includes(p.method)) {
        initialDeclarations.push({
          method: p.method,
          declaredAmount: p.total,
        });
      }
    });

    setDeclarations(initialDeclarations);
  }, [summary, isLoadingSummary]);

  const totalDeclared = declarations.reduce(
    (sum, d) => sum + Number(d.declaredAmount || 0),
    0
  );

  const handleDeclaredChange = (method: string, value: string) => {
    setDeclarations((prev) =>
      prev.map((d) =>
        d.method === method ? { ...d, declaredAmount: value === "null" ? null : parseFloat(value) || 0 } : d
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Require all fields to be non-zero
    const hasEmpty = declarations.some((d) => d.declaredAmount === null || d.declaredAmount < 0);
    if (hasEmpty) {
      toast.error("Please enter a valid amount for each payment method.");
      return;
    }
    try {
      const selectedCategory = reasonCategories?.find(c => c.id === reasonCategoryId);
      
      // Client-side validation for description length
      if (selectedCategory && notes.length < selectedCategory.min_description_length) {
        toast.error(`The '${selectedCategory.label}' category requires at least ${selectedCategory.min_description_length} characters of explanation.`);
        return;
      }

      await closeSession({
        id: sessionId,
        paymentDeclarations: declarations.map(d => ({ method: d.method, declaredAmount: d.declaredAmount || 0 })),
        notes,
        reasonCategoryId,
      }).unwrap();
      toast.success("POS Session closed successfully");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      if (error?.data?.Error?.body) {
        setFormError(error.data.Error.body);
      } else {
        toast.error(error?.data?.message || "Failed to close POS session");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="size-5 text-primary" />
            Close POS Session
          </DialogTitle>
          <DialogDescription>
            Enter the actual amount collected for each payment method today. The system will automatically add your opening balance to calculate the final total.
          </DialogDescription>
        </DialogHeader>

        {isLoadingSummary ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 py-2">
            {/* Sales Breakdown Summary */}
            <div className="space-y-2.5 rounded-lg border bg-muted/30 p-4 text-sm">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-1">
                <Info className="size-3.5" />
                System Sales Summary
              </h4>
              <div className="space-y-1.5">
                {["cash", "stripe"].map((method) => {
                  const systemTotal = summary?.paymentBreakdown?.find((p: any) => p.method === method)?.total || 0;
                  return (
                    <div key={method} className="flex justify-between items-center">
                      <span className="text-muted-foreground capitalize">{method} Sales</span>
                      <span className="font-semibold">${systemTotal.toFixed(2)}</span>
                    </div>
                  );
                })}
                {/* Show any other methods if they exist */}
                {summary?.paymentBreakdown?.filter((p: any) => !["cash", "stripe"].includes(p.method)).map((p: any) => (
                  <div key={p.method} className="flex justify-between items-center text-muted-foreground italic">
                    <span className="capitalize">{p.method} Sales</span>
                    <span className="font-semibold">${p.total.toFixed(2)}</span>
                  </div>
                ))}
                {summary?.openingBalance > 0 && (
                  <div className="flex justify-between items-center text-blue-600">
                    <span>Opening Balance</span>
                    <span className="font-semibold">${Number(summary.openingBalance).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-1.5 mt-1.5 flex justify-between items-center font-bold text-primary">
                  <span>Grand Total</span>
                  <span>${((summary?.totalSales || 0) + (summary?.openingBalance || 0)).toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground italic border-t pt-2">
                Processed {summary?.transactionsCount ?? 0} completed transaction(s) this shift.
              </div>
            </div>

            {/* Per-method entries */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">
                Actual Amount Collected
              </Label>
              {declarations.map((decl) => (
                <div key={decl.method} className="grid gap-1.5">
                  <Label
                    htmlFor={`decl-${decl.method}`}
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    {METHOD_LABELS[decl.method] ?? decl.method}
                    <Badge variant="outline" className="text-[10px] h-4 px-1 font-normal capitalize">
                      {decl.method}
                    </Badge>
                  </Label>
                  <Input
                    id={`decl-${decl.method}`}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={decl.declaredAmount === null ? "" : decl.declaredAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleDeclaredChange(decl.method, val === "" ? "null" : val);
                    }}
                    required
                  />
                </div>
              ))}
            </div>


            <div className="space-y-3 pt-2">
              <div className="grid gap-2">
                <Label htmlFor="reason-category" className="flex items-center gap-2">
                  Reason Category
                  {Math.abs(totalDeclared - ((summary?.totalSales || 0) + (summary?.openingBalance || 0))) > 0.01 && (
                    <Badge variant="destructive" className="text-[10px] h-4 px-1 animate-pulse">
                      Discrepancy Detected
                    </Badge>
                  )}
                </Label>
                <Select
                  value={reasonCategoryId}
                  onValueChange={(val) => {
                    setReasonCategoryId(val);
                    setFormError(null);
                  }}
                  disabled={isLoadingReasons}
                >
                  <SelectTrigger id="reason-category">
                    <SelectValue placeholder="Select a reason category" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]" position="popper">
                    {reasonCategories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label} {cat.min_description_length > 0 ? `(Details Required)` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {reasonCategoryId && reasonCategories?.find(c => c.id === reasonCategoryId)?.is_anomaly_trigger && (
                  <p className="text-[10px] text-destructive flex items-center gap-1">
                    <AlertTriangle className="size-3" />
                    This reason will trigger a high-priority audit flag.
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="close-notes" className="flex justify-between">
                  <span>Additional Details</span>
                  {reasonCategoryId && (
                    <span className="text-[10px] text-muted-foreground italic">
                      Min. {reasonCategories?.find(c => c.id === reasonCategoryId)?.min_description_length || 0} chars
                    </span>
                  )}
                </Label>
                <Textarea
                  id="close-notes"
                  placeholder="Provide more context here..."
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    setFormError(null);
                  }}
                  rows={2}
                  className={
                    (reasonCategoryId && notes.length < (reasonCategories?.find(c => c.id === reasonCategoryId)?.min_description_length || 0)) || formError
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }
                />
                {formError && (
                  <p className="text-[11px] font-medium text-destructive animate-heading-in">
                    {formError}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={isClosing}
                variant="destructive"
                className="w-full"
              >
                {isClosing ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Closing...
                  </>
                ) : (
                  "Close Session & End Shift"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
