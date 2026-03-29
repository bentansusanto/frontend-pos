"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2 } from "lucide-react";
import { useDisposeProductBatchMutation } from "@/store/services/product-batch.service";
import { toast } from "sonner";

interface DisposeBatchDialogProps {
  batch: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful dispose so the parent can refresh */
  onSuccess?: () => void;
}

/**
 * DisposeBatchDialog — confirmation dialog for writing off (expiring) a batch.
 * Records an EXPIRED stock movement in the backend for a full audit trail.
 */
export default function DisposeBatchDialog({
  batch,
  open,
  onOpenChange,
  onSuccess,
}: DisposeBatchDialogProps) {
  const [reason, setReason] = useState("");
  const [dispose, { isLoading }] = useDisposeProductBatchMutation();

  if (!batch) return null;

  const handleDispose = async () => {
    try {
      await dispose({ id: batch.id, reason: reason || undefined }).unwrap();
      toast.success(`Batch ${batch.batchNumber || batch.id} has been disposed.`);
      setReason("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to dispose batch");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <Trash2 className="h-7 w-7 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Dispose Batch?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            You are about to write off{" "}
            <span className="font-bold text-foreground">
              {batch.currentQuantity} unit(s)
            </span>{" "}
            from batch{" "}
            <span className="font-bold text-foreground">
              {batch.batchNumber || batch.id}
            </span>
            . This action will set the batch status to{" "}
            <span className="font-semibold text-destructive">Expired</span> and
            record a stock write-off movement. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Optional reason field for audit trail */}
        <div className="space-y-2 px-2 py-2">
          <Label htmlFor="dispose-reason" className="text-sm font-medium">
            Reason (optional but recommended)
          </Label>
          <Input
            id="dispose-reason"
            placeholder="e.g. Damaged packaging, Contaminated, etc."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="bg-muted/50"
          />
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDispose}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90 gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {isLoading ? "Disposing..." : "Confirm Dispose"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
