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
import { Loader2, ClipboardList, Info } from "lucide-react";

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

  useEffect(() => {
    if (summary?.paymentBreakdown && summary.paymentBreakdown.length > 0) {
      setDeclarations(
        summary.paymentBreakdown.map((p: { method: string }) => ({
          method: p.method,
          declaredAmount: 0,
        }))
      );
    } else if (!isLoadingSummary) {
      // Fallback: at least one cash entry
      setDeclarations([{ method: "cash", declaredAmount: 0 }]);
    }
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
      await closeSession({
        id: sessionId,
        paymentDeclarations: declarations.map(d => ({ method: d.method, declaredAmount: d.declaredAmount || 0 })),
        notes,
      }).unwrap();
      toast.success("POS Session closed successfully");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to close POS session");
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
            {/* Transactions Count — only neutral info */}
            <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              <Info className="size-4 shrink-0" />
              <span>
                You processed{" "}
                <span className="font-semibold text-foreground">
                  {summary?.transactionsCount ?? 0} completed transaction(s)
                </span>{" "}
                this shift.
              </span>
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
                    <Badge variant="outline" className="text-xs font-normal capitalize">
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


            <div className="grid gap-2">
              <Label htmlFor="close-notes">Notes (Optional)</Label>
              <Textarea
                id="close-notes"
                placeholder="E.g. Cash count matches, card machine verified"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
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
