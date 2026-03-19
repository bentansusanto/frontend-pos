"use client";

import { Box, ClipboardList, Layers, Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { toast } from "sonner";
import { HooksAddProduct } from "./hooks";

export const AddProduct = () => {
  const {
    formik,
    categories,
    isCategoriesLoading,
    isSubmitting,
    isCreatingCategory,
    handleCreateCategory,
    currentStep,
    setCurrentStep
  } = HooksAddProduct();
  const [categoryName, setCategoryName] = useState("");
  const productThumbnailInputRef = useRef<HTMLInputElement>(null);
  const productImagesInputRef = useRef<HTMLInputElement>(null);

  const handleCategoryCreate = async () => {
    if (!categoryName.trim()) {
      return;
    }
    await handleCreateCategory(categoryName.trim());
    setCategoryName("");
  };

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const imageSeparator = "||";

  const parseImagesValue = (value: string) => {
    if (!value) {
      return [];
    }
    if (value.includes(imageSeparator)) {
      return value
        .split(imageSeparator)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    const trimmed = value.trim();
    if (trimmed.startsWith("data:")) {
      return [trimmed];
    }
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const stringifyImagesValue = (images: string[]) => images.join(imageSeparator);

  const isValidImageSrc = (value: string) =>
    value.startsWith("data:") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/") ||
    value.startsWith("blob:");

  const handleProductThumbnailFiles = async (files: FileList | null) => {
    if (!files || !files.length) {
      return;
    }
    const dataUrl = await readFileAsDataUrl(files[0]);
    await formik.setFieldValue("product.thumbnail", dataUrl);
    await formik.setFieldValue("product.thumbnailFile", files[0]);
  };

  const handleProductImagesFiles = async (files: FileList | null) => {
    if (!files || !files.length) {
      return;
    }
    const dataUrls = await Promise.all([files[0]].map(readFileAsDataUrl));
    const existingImages = parseImagesValue(formik.values.product.images || "");
    await formik.setFieldValue(
      "product.images",
      stringifyImagesValue([...existingImages, ...dataUrls])
    );
    const existingFiles = formik.values.product.imageFiles || [];
    await formik.setFieldValue("product.imageFiles", [...existingFiles, files[0]]);
  };

  const productThumbnailPreview = isValidImageSrc(formik.values.product.thumbnail || "")
    ? formik.values.product.thumbnail
    : "";
  const parsedProductImages = parseImagesValue(formik.values.product.images || "");
  const productImagesPreview = parsedProductImages.filter(isValidImageSrc);

  const handleRemoveProductImage = (indexToRemove: number) => {
    const remainingImages = parsedProductImages.filter((_, index) => index !== indexToRemove);
    void formik.setFieldValue("product.images", stringifyImagesValue(remainingImages));
    const currentFiles = formik.values.product.imageFiles || [];
    const remainingFiles = currentFiles.filter((_: any, index: number) => index !== indexToRemove);
    void formik.setFieldValue("product.imageFiles", remainingFiles);
  };

  const steps = [
    { title: "Identity", icon: ClipboardList, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Variants", icon: Layers, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  ];

  const handleNext = async () => {
    let fieldsToValidate: string[] = [];
    if (currentStep === 1) {
      fieldsToValidate = [
        "product.name_product",
        "product.category_id",
        "product.description",
        "product.thumbnail",
        "product.images"
      ];
    } else if (currentStep === 2) {
      fieldsToValidate = formik.values.variants.map((_, i: number) => [`variants[${i}].name_variant`, `variants[${i}].sku`]).flat();
    }

    const errors = await formik.validateForm();
    const stepErrors = fieldsToValidate.filter((field: string) => {
      const parts = field.split('.');
      let error = errors as any;
      for (const part of parts) {
        if (!error[part]) return false;
        error = error[part];
      }
      return !!error;
    });

    if (stepErrors.length === 0) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    } else {
      // Mark fields as touched to show errors
      fieldsToValidate.forEach(field => formik.setFieldTouched(field, true));
      toast.error("Please fix the errors before proceeding.");
    }
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <form 
      className="space-y-6" 
      onSubmit={(e) => { e.preventDefault(); }} 
      encType="multipart/form-data"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
        }
      }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Create Inventory</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard/default">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard/inventory/products">Inventory</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>New Product</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Modern Robust Stepper */}
      <div className="max-w-4xl mx-auto w-full px-4 mb-16 mt-8">
        <div className="flex items-center justify-between relative">
          {/* Background Line */}
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-muted/30 -translate-y-1/2 z-0" />
          
          {/* Active Progress Line */}
          <div 
            className="absolute top-1/2 left-0 h-[2px] bg-primary -translate-y-1/2 z-0 transition-all duration-700 ease-in-out" 
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === index + 1;
            const isCompleted = currentStep > index + 1;

            return (
              <div key={index} className="flex flex-col items-center relative z-10">
                <button
                  type="button"
                  onClick={() => isCompleted && setCurrentStep(index + 1)}
                  className={`
                    flex size-12 items-center justify-center rounded-2xl transition-all duration-500 ring-8 ring-background
                    ${isActive ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/40 scale-110" : 
                      isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
                  `}
                >
                  <StepIcon className={`size-6 ${isActive || isCompleted ? "animate-in zoom-in-50" : ""}`} />
                </button>
                <div className="absolute -bottom-8 w-max text-center">
                  <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${isActive ? "text-primary" : "text-muted-foreground/60"}`}>
                    {step.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6">
        {/* Step 1: Identity */}
        {currentStep === 1 && (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <Card className="border-none shadow-xl bg-background/50 backdrop-blur-xl overflow-hidden">
                <CardHeader className="bg-muted/20 border-b">
                  <CardTitle className="text-sm font-black uppercase tracking-widest">General Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest">Product Name</Label>
                    <Input
                      name="product.name_product"
                      placeholder="e.g. Premium Arabica Coffee"
                      value={formik.values.product.name_product}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="bg-background/50"
                    />
                    {formik.touched.product?.name_product && (formik.errors.product as any)?.name_product && (
                      <p className="text-[10px] font-bold text-destructive">{(formik.errors.product as any).name_product}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest">Description</Label>
                    <Textarea
                      name="product.description"
                      placeholder="Briefly describe the product..."
                      className="min-h-32 bg-background/50"
                      value={formik.values.product.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl bg-background/50 backdrop-blur-xl overflow-hidden">
                <CardHeader className="bg-muted/20 border-b">
                  <CardTitle className="text-sm font-black uppercase tracking-widest">Categorization</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Category</Label>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button type="button" variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest hover:text-primary">
                            <Plus className="mr-1 size-3" /> New Category
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add Category</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-2 py-4">
                            <Label>Category Name</Label>
                            <Input
                              placeholder="Type category name"
                              value={categoryName}
                              onChange={(event) => setCategoryName(event.target.value)}
                            />
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                              type="button"
                              onClick={handleCategoryCreate}
                              disabled={isCreatingCategory || !categoryName.trim()}>
                              Create Category
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {categories.map((category: any) => {
                        const isSelected = String(formik.values.product.category_id) === String(category.id);
                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => formik.setFieldValue("product.category_id", String(category.id))}
                            className={`flex items-center gap-3 rounded-xl border p-3 w-full text-left transition-all ${
                              isSelected
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                : "border-border/50 bg-background/50 hover:bg-muted/50"
                            }`}>
                            <div className={`size-4 shrink-0 rounded-full border flex items-center justify-center transition-all ${
                               isSelected ? "bg-primary border-primary" : "border-slate-300 bg-white"
                            }`}>
                               {isSelected && <div className="size-1.5 rounded-full bg-white animate-in zoom-in-50" />}
                            </div>
                            <span className={`text-xs font-bold transition-colors ${isSelected ? "text-primary" : "text-slate-600"}`}>
                              {category.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-none shadow-xl bg-background/50 backdrop-blur-xl overflow-hidden">
                <CardHeader className="bg-muted/20 border-b">
                  <CardTitle className="text-sm font-black uppercase tracking-widest">Media Assets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest">Thumbnail</Label>
                    <div
                      onClick={() => productThumbnailInputRef.current?.click()}
                      className="group relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border/50 bg-muted/20 transition-all hover:bg-muted/30">
                      {productThumbnailPreview ? (
                        <Image src={productThumbnailPreview} alt="Thumbnail" fill className="object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground transition-all group-hover:text-primary">
                          <Plus className="size-8" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Upload Cover</span>
                        </div>
                      )}
                    </div>
                    <input ref={productThumbnailInputRef} type="file" className="hidden" onChange={(e) => void handleProductThumbnailFiles(e.target.files)} />
                    <Input
                      name="product.thumbnail"
                      placeholder="Or enter URL"
                      value={formik.values.product.thumbnail}
                      onChange={formik.handleChange}
                      className="bg-background/50 mt-2 text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest">Gallery</Label>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {productImagesPreview.map((image, index) => (
                        <div key={index} className="group relative aspect-square overflow-hidden rounded-xl border">
                          <Image src={image} alt="Gallery" fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveProductImage(index)}
                            className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100">
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div
                      onClick={() => productImagesInputRef.current?.click()}
                      className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-dashed hover:bg-muted/30 transition-all">
                      <Plus className="size-4 text-muted-foreground" />
                    </div>
                    <input ref={productImagesInputRef} type="file" className="hidden" onChange={(e) => void handleProductImagesFiles(e.target.files)} />
                    <Input
                      name="product.images"
                      placeholder="URLs separated by commas"
                      value={formik.values.product.images}
                      onChange={formik.handleChange}
                      className="bg-background/50 mt-2 text-xs"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 2: Variants */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <Card className="border-none shadow-xl bg-background/50 backdrop-blur-xl overflow-hidden">
              <CardHeader className="bg-muted/20 border-b flex flex-row items-center justify-between py-6 px-8">
                <div>
                  <CardTitle className="text-lg font-black tracking-tight">Product Variants</CardTitle>
                  <CardDescription className="text-xs">Define options like size, color, or material</CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={() => formik.setFieldValue("variants", [...formik.values.variants, { name_variant: "", sku: "", barcode: "", price: 0, cost_price: 0 }])}
                  className="rounded-xl font-black uppercase tracking-widest text-[10px]">
                  <Plus className="mr-2 size-4" /> Add Variant
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {formik.values.variants.map((variant: any, index: number) => (
                    <div key={index} className="p-8 group hover:bg-muted/10 transition-colors">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary font-black text-sm">
                            {index + 1}
                          </div>
                          <h4 className="font-bold text-foreground">Configuration</h4>
                        </div>
                        {formik.values.variants.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 h-8"
                            onClick={() => formik.setFieldValue("variants", formik.values.variants.filter((_: any, i: number) => i !== index))}>
                            <Minus className="mr-1 size-3" /> Remove
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Variant Name</Label>
                          <Input
                            name={`variants[${index}].name_variant`}
                            placeholder="e.g. Regular / Large"
                            value={variant.name_variant}
                            onChange={formik.handleChange}
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Selling Price</Label>
                          <Input
                            type="number"
                            name={`variants[${index}].price`}
                            placeholder="0"
                            value={variant.price}
                            onChange={formik.handleChange}
                            className="bg-background/50 font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Barcode (Optional)</Label>
                          <Input
                            name={`variants[${index}].barcode`}
                            placeholder="Scan or enter barcode"
                            value={variant.barcode}
                            onChange={formik.handleChange}
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cost Price</Label>
                          <Input
                            type="number"
                            name={`variants[${index}].cost_price`}
                            placeholder="0"
                            value={variant.cost_price}
                            onChange={formik.handleChange}
                            className="bg-background/50 text-muted-foreground"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}


        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t bg-muted/5 p-6 backdrop-blur-md sticky bottom-0">
          <div>
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting} className="rounded-xl font-black uppercase tracking-widest text-[10px]">
                 Previous Step
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
             <Button
                type="button"
                variant="ghost"
                onClick={() => formik.resetForm()}
                disabled={isSubmitting}
                className="text-muted-foreground font-bold text-[10px] uppercase truncate">
                Discard Changes
              </Button>
              {currentStep < steps.length ? (
                <Button type="button" onClick={handleNext} className="rounded-xl font-black uppercase tracking-widest text-[10px] px-8 py-6 shadow-xl shadow-primary/20">
                  Next Step
                </Button>
              ) : (
                <Button type="button" onClick={() => formik.submitForm()} disabled={isSubmitting} className="rounded-xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-[10px] px-8 py-6 shadow-xl shadow-primary/30">
                  {isSubmitting ? "Finalizing Creation..." : "Create Inventory"}
                </Button>
              )}
          </div>
        </div>
      </div>
    </form>
  );
};
