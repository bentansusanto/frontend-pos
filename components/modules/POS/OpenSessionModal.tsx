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

  const formik = useFormik<OpenSessionValues>({
    initialValues: {
      branch_id: branchId,
      openingBalance: 0,
      notes: ""
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
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
          <DialogTitle>Open POS Session</DialogTitle>
          <DialogDescription>
            You need to open a session before you can process orders. Enter your opening balance to
            start your shift.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="openingBalance">Opening Balance</Label>
            <Input
              id="openingBalance"
              name="openingBalance"
              type="number"
              placeholder="0.00"
              value={formik.values.openingBalance}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.openingBalance && formik.errors.openingBalance && (
              <p className="text-xs text-red-500">{formik.errors.openingBalance}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="E.g. Morning shift, register #1"
              value={formik.values.notes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Opening..." : "Open Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
