"use client";

import Image from "next/image";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useUpdateVariant } from "./hooks";

interface UpdateVariantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantId: string;
  productId: string;
  initialData: any;
  onSuccess?: () => void;
}

export const UpdateVariantDialog = ({
  open,
  onOpenChange,
  variantId,
  productId,
  initialData,
  onSuccess
}: UpdateVariantDialogProps) => {
  const { formik, isLoading } = useUpdateVariant({
    variantId,
    productId,
    initialData,
    onSuccess: () => {
      onOpenChange(false);
      if (onSuccess) onSuccess();
    }
  });

  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const handleThumbnailFiles = async (files: FileList | null) => {
    if (!files || !files.length) {
      return;
    }
    const dataUrl = await readFileAsDataUrl(files[0]);
    await formik.setFieldValue("thumbnail", dataUrl);
    await formik.setFieldValue("thumbnailFile", files[0]);
  };

  const isValidImageSrc = (value: string) =>
    value.startsWith("data:") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/") ||
    value.startsWith("blob:");

  const thumbnailPreview = isValidImageSrc(formik.values.thumbnail || "")
    ? formik.values.thumbnail
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Update Variant</DialogTitle>
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
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              placeholder=""
              value={isNaN(formik.values.price) ? "" : formik.values.price}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                formik.setFieldValue("price", isNaN(val) ? 0 : val);
              }}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (Optional)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                placeholder="0"
                value={formik.values.weight ?? ""}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  formik.setFieldValue("weight", isNaN(val) ? undefined : val);
                }}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.weight && formik.errors.weight
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {formik.touched.weight && formik.errors.weight && (
                <p className="text-xs text-red-500">{formik.errors.weight as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color (Optional)</Label>
              <Input
                id="color"
                name="color"
                placeholder="e.g. #FF0000 or Red"
                value={formik.values.color}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.color && formik.errors.color
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {formik.touched.color && formik.errors.color && (
                <p className="text-xs text-red-500">{formik.errors.color as string}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Thumbnail (Optional)</Label>
            <div className="flex flex-col gap-3">
              {thumbnailPreview && (
                <div className="relative h-40 w-full overflow-hidden rounded-xl border">
                  <Image
                    src={thumbnailPreview}
                    alt="Variant thumbnail"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div
                className="text-muted-foreground flex min-h-24 cursor-pointer items-center justify-center rounded-xl border border-dashed text-sm hover:bg-slate-50"
                onClick={() => thumbnailInputRef.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  void handleThumbnailFiles(event.dataTransfer.files);
                }}>
                Drag & drop thumbnail or click to upload
              </div>

              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => void handleThumbnailFiles(event.target.files)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Variant"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
