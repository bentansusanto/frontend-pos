"use client";

import { useRef } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAddVariant } from "./hooks";

interface AddVariantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  onSuccess?: () => void;
}

export const AddVariantDialog = ({
  open,
  onOpenChange,
  productId,
  onSuccess
}: AddVariantDialogProps) => {
  const { formik, isLoading } = useAddVariant({
    productId,
    onSuccess: () => {
      onOpenChange(false);
      if (onSuccess) onSuccess();
    }
  });




  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Variant</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name_variant">Variant Name</Label>
            <Input
              id="name_variant"
              name="name_variant"
              placeholder="e.g. XL, Red, 250g"
              value={formik.values.name_variant}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                formik.touched.name_variant && formik.errors.name_variant
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }
            />
            {formik.touched.name_variant && formik.errors.name_variant && (
              <p className="text-xs text-red-500">{formik.errors.name_variant as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode (Optional)</Label>
            <Input
              id="barcode"
              name="barcode"
              placeholder="Scan or enter barcode"
              value={formik.values.barcode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              placeholder="0"
              value={formik.values.price}
              onChange={(e) => formik.setFieldValue("price", parseFloat(e.target.value))}
              onBlur={formik.handleBlur}
              className={
                formik.touched.price && formik.errors.price
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }
            />
            {formik.touched.price && formik.errors.price && (
              <p className="text-xs text-red-500">{formik.errors.price as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost_price">Cost Price (Optional)</Label>
            <Input
              id="cost_price"
              name="cost_price"
              type="number"
              placeholder="0"
              value={formik.values.cost_price}
              onChange={(e) => formik.setFieldValue("cost_price", parseFloat(e.target.value))}
              onBlur={formik.handleBlur}
              className={
                formik.touched.cost_price && formik.errors.cost_price
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }
            />
            {formik.touched.cost_price && formik.errors.cost_price && (
              <p className="text-xs text-red-500">{formik.errors.cost_price as string}</p>
            )}
          </div>


          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Variant"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
