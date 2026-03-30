"use client";

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2, Pencil, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUpdateProductBatchMutation } from "@/store/services/product-batch.service";

// Edit schema — only fields that are safe to change after creation
const editBatchSchema = z.object({
  batchNumber: z.string().min(1, "Batch number is required"),
  costPrice: z.coerce.number().min(0, "Cost price cannot be negative"),
  expiryDate: z.date().optional(),
  manufacturingDate: z.date().optional(),
  receivedDate: z.date().optional(),
  status: z.enum(["active", "expired", "hold", "sold_out"]),
});

type EditBatchValues = z.infer<typeof editBatchSchema>;

interface EditBatchDialogProps {
  batch: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after successful update so parent can refresh data */
  onSuccess?: () => void;
}

/**
 * EditBatchDialog — allows updating a batch's mutable fields:
 * batch number, cost price, dates, and status.
 * Immutable fields (product, branch, initial quantity) are shown read-only.
 */
export default function EditBatchDialog({
  batch,
  open,
  onOpenChange,
  onSuccess,
}: EditBatchDialogProps) {
  const [updateBatch, { isLoading }] = useUpdateProductBatchMutation();

  const form = useForm<EditBatchValues>({
    resolver: zodResolver(editBatchSchema),
    defaultValues: {
      batchNumber: "",
      costPrice: 0,
      status: "active",
    },
  });

  // Pre-fill form fields whenever a batch is selected for editing
  useEffect(() => {
    if (batch && open) {
      form.reset({
        batchNumber: batch.batchNumber || "",
        costPrice: Number(batch.costPrice) || 0,
        status: batch.status || "active",
        expiryDate: batch.expiryDate ? parseISO(batch.expiryDate) : undefined,
        manufacturingDate: batch.manufacturingDate
          ? parseISO(batch.manufacturingDate)
          : undefined,
        receivedDate: batch.receivedDate
          ? parseISO(batch.receivedDate)
          : undefined,
      });
    }
  }, [batch, open, form]);

  const onSubmit = async (values: EditBatchValues) => {
    try {
      const payload = {
        ...values,
        // Convert Date objects back to ISO strings for the API
        expiryDate: values.expiryDate?.toISOString(),
        manufacturingDate: values.manufacturingDate?.toISOString(),
        receivedDate: values.receivedDate?.toISOString(),
      };
      await updateBatch({ id: batch.id, body: payload }).unwrap();
      toast.success("Batch updated successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update batch");
    }
  };

  if (!batch) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-white p-0 overflow-hidden">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />

        <DialogHeader className="px-8 pt-8 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Pencil className="h-5 w-5 text-primary" />
            Edit Batch
          </DialogTitle>
          <DialogDescription>
            Modifying{" "}
            <span className="font-semibold text-foreground">
              {batch.batchNumber || batch.id}
            </span>{" "}
            — immutable fields (product, branch, quantity) are shown for reference only.
          </DialogDescription>
        </DialogHeader>

        {/* Read-only reference info */}
        <div className="mx-8 mb-4 rounded-xl border border-dashed bg-muted/30 p-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">Product</p>
            <p className="font-medium">
              {batch.productVariant?.product?.name_product || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">Initial Qty</p>
            <p className="font-medium">{batch.initialQuantity}</p>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 px-8 pb-8"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Batch Number */}
              <FormField
                control={form.control}
                name="batchNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">
                      Batch Number
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-muted/30" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">
                      Status
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-muted/30">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="hold">On Hold</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="sold_out">Sold Out</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Cost Price */}
            <FormField
              control={form.control}
              name="costPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-muted-foreground">
                    Cost Price per Unit
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">
                        $
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        className="bg-muted/30 pl-7 font-mono"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* Expiry Date */}
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">
                      Expiry Date
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full text-left font-normal bg-muted/30",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "dd MMM yyyy") : "Select date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Manufacturing Date */}
              <FormField
                control={form.control}
                name="manufacturingDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">
                      Mfg. Date
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full text-left font-normal bg-muted/30",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "dd MMM yyyy") : "Select date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 gap-2 font-bold"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isLoading ? "Saving Changes..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
