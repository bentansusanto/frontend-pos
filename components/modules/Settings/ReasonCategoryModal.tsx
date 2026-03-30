"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  ReasonCategory, 
  useCreateReasonCategoryMutation, 
  useUpdateReasonCategoryMutation 
} from "@/store/services/reason-category.service";

interface ReasonCategoryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ReasonCategory | null;
}

export function ReasonCategoryModal({ 
  isOpen, 
  onOpenChange, 
  category 
}: ReasonCategoryModalProps) {
  const isEditing = !!category;

  const [createCategory, { isLoading: isCreating }] = useCreateReasonCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateReasonCategoryMutation();

  const { register, handleSubmit, reset, setValue, watch } = useForm<Partial<ReasonCategory>>({
    defaultValues: {
      label: "",
      type: "refund",
      min_description_length: 0,
      is_anomaly_trigger: false,
    }
  });

  const type = watch("type");
  const isAnomalyTrigger = watch("is_anomaly_trigger");

  useEffect(() => {
    if (category) {
      reset({
        label: category.label,
        type: category.type,
        min_description_length: category.min_description_length,
        is_anomaly_trigger: category.is_anomaly_trigger,
      });
    } else {
      reset({
        label: "",
        type: "refund",
        min_description_length: 0,
        is_anomaly_trigger: false,
      });
    }
  }, [category, reset, isOpen]);

  const onSubmit = async (data: Partial<ReasonCategory>) => {
    try {
      if (isEditing && category) {
        await updateCategory({ id: category.id, ...data }).unwrap();
        toast.success("Category updated successfully");
      } else {
        await createCategory({ 
          ...data, 
          value: (data.label || "").toUpperCase().replace(/\s+/g, "_") 
        }).unwrap();
        toast.success("Category created successfully");
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Something went wrong");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Category" : "Add New Category"}</DialogTitle>
          <DialogDescription>
            Configure how this reason category behaves in POS workflows.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="label">Display Label</Label>
            <Input
              id="label"
              placeholder="e.g. Damaged Product"
              {...register("label", { required: true })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="type">Workflow Type</Label>
            <Select 
              value={type} 
              onValueChange={(val: any) => setValue("type", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="z-[101]">
                <SelectItem value="refund">Refund</SelectItem>
                <SelectItem value="pos_session">POS Session (Close Shift)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="min_length">Min. Description Length</Label>
            <Input
              id="min_length"
              type="number"
              {...register("min_description_length", { valueAsNumber: true })}
            />
            <p className="text-[10px] text-muted-foreground italic">
              User must provide explanation at least this long when choosing this category.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
            <div className="space-y-0.5">
              <Label className="text-sm">Trigger AI Anomaly</Label>
              <p className="text-[10px] text-muted-foreground">
                Highlight transactions with this reason for high-priority AI audit.
              </p>
            </div>
            <Switch
              checked={isAnomalyTrigger}
              onCheckedChange={(checked) => setValue("is_anomaly_trigger", checked)}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {isEditing ? "Update Category" : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
