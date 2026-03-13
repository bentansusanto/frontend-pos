"use client";

import { useFormik } from "formik";
import { toast } from "sonner";
import { z } from "zod";

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
import { Separator } from "@/components/ui/separator";
import { 
  useCloseSessionMutation, 
  useGetSessionSummaryQuery 
} from "@/store/services/pos-session.service";
import { Loader2 } from "lucide-react";

const closeSessionSchema = z.object({
  closingBalance: z.coerce.number().min(0, "Closing balance must be at least 0"),
  notes: z.string().optional()
});

type CloseSessionValues = z.infer<typeof closeSessionSchema>;

interface CloseSessionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  onSuccess?: () => void;
}

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

  const formik = useFormik<CloseSessionValues>({
    initialValues: {
      closingBalance: summary?.expected_cash || 0,
      notes: ""
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await closeSession({
          id: sessionId,
          ...values
        }).unwrap();
        toast.success("POS Session closed successfully");
        onSuccess?.();
        onOpenChange(false);
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to close POS session");
      }
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Close POS Session</DialogTitle>
          <DialogDescription>
            Review session summary and enter final balance to close your shift.
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingSummary ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={formik.handleSubmit} className="space-y-4 py-2">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Opening Balance</span>
                <span className="font-medium">${Number(summary?.openingBalance || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Sales</span>
                <span className="font-medium text-green-600">+${Number(summary?.totalSales || 0).toFixed(2)}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between text-base font-bold">
                <span>Expected Balance</span>
                <span>${Number(summary?.expected_cash || 0).toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Based on {summary?.transactionsCount || 0} completed transactions.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="closingBalance">Actual Closing Balance</Label>
              <Input
                id="closingBalance"
                name="closingBalance"
                type="number"
                placeholder="0.00"
                value={formik.values.closingBalance}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.closingBalance && formik.errors.closingBalance && (
                <p className="text-xs text-red-500">{formik.errors.closingBalance}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="E.g. Cash matches expected amount"
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isClosing} variant="destructive" className="w-full">
                {isClosing ? "Closing..." : "Close Session & End Shift"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
