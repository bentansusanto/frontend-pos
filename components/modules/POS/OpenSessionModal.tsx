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
import { useOpenSessionMutation } from "@/store/services/pos-session.service";
import { useCheckBranchFrozenQuery } from "@/store/services/stock-take.service";
import { AlertTriangle, Lock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const openSessionSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  openingBalance: z.coerce.number().min(0, "Opening balance must be at least 0"),
  notes: z.string().optional()
});

type OpenSessionValues = z.infer<typeof openSessionSchema>;

interface OpenSessionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  onSuccess?: () => void;
}

export const OpenSessionModal = ({
  isOpen,
  onOpenChange,
  branchId,
  onSuccess
}: OpenSessionModalProps) => {
  const [openSession, { isLoading }] = useOpenSessionMutation();
  const { data: frozenData, isLoading: isCheckingFrozen } = useCheckBranchFrozenQuery(branchId, {
    skip: !branchId,
  });

  const isFrozen = frozenData?.isFrozen;

  const formik = useFormik<OpenSessionValues>({
    initialValues: {
      branch_id: branchId,
      openingBalance: 0,
      notes: ""
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (isFrozen) {
        toast.error("Cannot open session while branch is frozen for audit");
        return;
      }
      try {
        await openSession(values).unwrap();
        toast.success("POS Session opened successfully");
        onSuccess?.();
        onOpenChange(false);
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to open POS session");
      }
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isFrozen && <Lock className="size-5 text-rose-500" />}
            Open POS Session
          </DialogTitle>
          <DialogDescription>
            {isFrozen 
              ? "Access to POS is currently blocked due to an active inventory audit."
              : "You need to open a session before you can process orders. Enter your opening balance to start your shift."}
          </DialogDescription>
        </DialogHeader>

        {isFrozen && (
          <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800">
            <AlertTriangle className="size-4" />
            <AlertTitle>Branch Inventory Frozen</AlertTitle>
            <AlertDescription className="text-xs">
              A stock take session (<strong>#{frozenData.session?.id}</strong>) is currently in progress by <strong>{frozenData.session?.user?.name}</strong>. 
              POS operations are suspended until the audit is completed or rejected.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-4 py-4">
          <div className={`grid gap-2 ${isFrozen ? "opacity-50 pointer-events-none" : ""}`}>
            <Label htmlFor="openingBalance">Opening Balance</Label>
            <Input
              id="openingBalance"
              name="openingBalance"
              type="number"
              placeholder="0.00"
              disabled={isFrozen}
              value={formik.values.openingBalance}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.openingBalance && formik.errors.openingBalance && (
              <p className="text-xs text-red-500">{formik.errors.openingBalance}</p>
            )}
          </div>
          <div className={`grid gap-2 ${isFrozen ? "opacity-50 pointer-events-none" : ""}`}>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="E.g. Morning shift, register #1"
              disabled={isFrozen}
              value={formik.values.notes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isLoading || isCheckingFrozen || isFrozen} 
              className="w-full"
              variant={isFrozen ? "secondary" : "default"}
            >
              {isCheckingFrozen ? "Checking status..." : isFrozen ? "Inventory Frozen" : isLoading ? "Opening..." : "Open Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
