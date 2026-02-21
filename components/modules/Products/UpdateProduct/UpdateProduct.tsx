"use client";

import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { HooksUpdateProduct } from "./hooks";

const thumbnailImages = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=400&auto=format&fit=crop"
];

const productImages = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600&auto=format&fit=crop"
];

export const UpdateProduct = () => {
  const { formik, categories, isCategoriesLoading, isSubmitting } = HooksUpdateProduct();
  const productThumbnailInputRef = useRef<HTMLInputElement>(null);
  const productImagesInputRef = useRef<HTMLInputElement>(null);
  const variantThumbnailInputRef = useRef<HTMLInputElement>(null);

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

  const handleVariantThumbnailFiles = async (files: FileList | null) => {
    if (!files || !files.length) {
      return;
    }
    const dataUrl = await readFileAsDataUrl(files[0]);
    await formik.setFieldValue("variant.thumbnail", dataUrl);
    await formik.setFieldValue("variant.thumbnailFile", files[0]);
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
    await formik.setFieldValue("product.imageFiles", [...existingFiles, ...Array.from(files)]);
  };

  const productThumbnailPreview = isValidImageSrc(formik.values.product.thumbnail || "")
    ? formik.values.product.thumbnail || ""
    : thumbnailImages[0];
  const parsedProductImages = parseImagesValue(formik.values.product.images || "");
  const productImagesPreview =
    parsedProductImages.filter(isValidImageSrc).length > 0
      ? parsedProductImages.filter(isValidImageSrc)
      : productImages;
  const variantThumbnailPreview = isValidImageSrc(formik.values.variant.thumbnail || "")
    ? formik.values.variant.thumbnail || ""
    : thumbnailImages[0];

  const handleRemoveProductImage = (indexToRemove: number) => {
    const remainingImages = parsedProductImages.filter((_, index) => index !== indexToRemove);
    void formik.setFieldValue("product.images", stringifyImagesValue(remainingImages));
  };

  return (
    <form className="space-y-6" onSubmit={formik.handleSubmit}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Update Product</h1>
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
                  <Link href="/dashboard/inventory/products">Product List</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Update Product</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => formik.resetForm()}
            disabled={isSubmitting}>
            Discard Changes
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            Update Product
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name_product">Product Name</Label>
                <Input
                  id="name_product"
                  name="product.name_product"
                  placeholder="Xiaomi Watch 2 Pro"
                  value={formik.values.product.name_product}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.product?.name_product && formik.errors.product?.name_product
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                />
                {formik.touched.product?.name_product && formik.errors.product?.name_product && (
                  <p className="text-xs text-red-500">{formik.errors.product?.name_product}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="product.description"
                  placeholder="Write product description..."
                  className={`min-h-28 ${
                    formik.touched.product?.description && formik.errors.product?.description
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                  value={formik.values.product.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.product?.description && formik.errors.product?.description && (
                  <p className="text-xs text-red-500">{formik.errors.product?.description}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Category & Pricing</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Base Price</Label>
                <Input
                  id="price"
                  name="product.price"
                  placeholder="$ 118.89"
                  value={formik.values.product.price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount-percentage">Discount Percentage (%)</Label>
                <Input id="discount-percentage" placeholder="25%" />
              </div>
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="flash">Flash Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3 lg:col-span-3">
                <div className="space-y-3 rounded-xl border">
                  <Command>
                    <CommandInput placeholder="Search category" className="h-9" />
                    <CommandList>
                      <CommandEmpty>
                        {isCategoriesLoading ? "Loading categories..." : "No category found."}
                      </CommandEmpty>
                      <CommandGroup>
                        {categories.map((category: any) => (
                          <CommandItem
                            key={category.id}
                            value={category.name}
                            onSelect={() =>
                              formik.setFieldValue("product.category_id", category.id)
                            }>
                            <div className="flex items-center space-x-3 py-1">
                              <Checkbox
                                id={`category-${category.id}`}
                                checked={formik.values.product.category_id === category.id}
                                onCheckedChange={(checked) =>
                                  formik.setFieldValue(
                                    "product.category_id",
                                    checked ? category.id : ""
                                  )
                                }
                              />
                              <Label
                                htmlFor={`category-${category.id}`}
                                className="text-sm leading-none">
                                {category.name}
                              </Label>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
                {formik.touched.product?.category_id && formik.errors.product?.category_id && (
                  <p className="text-xs text-red-500">{formik.errors.product?.category_id}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Variation</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name_variant">Name Variant</Label>
                <Input
                  id="name_variant"
                  name="variant.name_variant"
                  placeholder="Xiaomi Watch 2 Pro - Black"
                  value={formik.values.variant.name_variant}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.variant?.name_variant && formik.errors.variant?.name_variant
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                />
                {formik.touched.variant?.name_variant && formik.errors.variant?.name_variant && (
                  <p className="text-xs text-red-500">{formik.errors.variant?.name_variant}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="variant_price">Price</Label>
                <Input
                  id="variant_price"
                  name="variant.price"
                  placeholder="$ 118.89"
                  value={formik.values.variant.price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.variant?.price && formik.errors.variant?.price
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                />
                {formik.touched.variant?.price && formik.errors.variant?.price && (
                  <p className="text-xs text-red-500">{formik.errors.variant?.price}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  name="variant.weight"
                  placeholder="250"
                  value={formik.values.variant.weight}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.variant?.weight && formik.errors.variant?.weight
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                />
                {formik.touched.variant?.weight && formik.errors.variant?.weight && (
                  <p className="text-xs text-red-500">{formik.errors.variant?.weight}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  name="variant.color"
                  placeholder="Midnight Black"
                  value={formik.values.variant.color}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.variant?.color && formik.errors.variant?.color
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                />
                {formik.touched.variant?.color && formik.errors.variant?.color && (
                  <p className="text-xs text-red-500">{formik.errors.variant?.color}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thumbnail Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-xs">Thumbnail previews</p>
              <div className="grid gap-3">
                <div className="relative h-40 overflow-hidden rounded-xl border">
                  <Image
                    src={productThumbnailPreview}
                    alt="Thumbnail product"
                    fill
                    className="object-cover"
                  />
                </div>
                <div
                  className="text-muted-foreground flex min-h-24 cursor-pointer items-center justify-center rounded-xl border border-dashed text-sm"
                  onClick={() => productThumbnailInputRef.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    void handleProductThumbnailFiles(event.dataTransfer.files);
                  }}>
                  Drag & drop thumbnail or click to upload
                </div>
                <input
                  ref={productThumbnailInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => void handleProductThumbnailFiles(event.target.files)}
                />
                <Input
                  id="thumbnail"
                  name="product.thumbnail"
                  placeholder="Thumbnail URL"
                  value={formik.values.product.thumbnail}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.product?.thumbnail && formik.errors.product?.thumbnail
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                />
                {formik.touched.product?.thumbnail && formik.errors.product?.thumbnail && (
                  <p className="text-xs text-red-500">{formik.errors.product?.thumbnail}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Product Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-xs">Photo Product</p>
              <div className="grid gap-3 rounded-xl border border-dashed p-4">
                <div className="grid grid-cols-3 gap-3">
                  {productImagesPreview.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="relative h-20 overflow-hidden rounded-lg border">
                      <Image src={image} alt="Product media" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveProductImage(index)}
                        className="absolute top-1 right-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-slate-900 hover:bg-white"
                        aria-label="Remove image">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div
                  className="text-muted-foreground flex min-h-24 cursor-pointer items-center justify-center rounded-xl border border-dashed text-sm"
                  onClick={() => productImagesInputRef.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    void handleProductImagesFiles(event.dataTransfer.files);
                  }}>
                  Drag & drop images or click to upload
                </div>
                <input
                  ref={productImagesInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => void handleProductImagesFiles(event.target.files)}
                />
                <Input
                  id="images"
                  name="product.images"
                  placeholder="Image URLs, separated by commas"
                  value={formik.values.product.images}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.product?.images && formik.errors.product?.images
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                />
                {formik.touched.product?.images && formik.errors.product?.images && (
                  <p className="text-xs text-red-500">{formik.errors.product?.images}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Variant Thumbnail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-xs">Thumbnail previews</p>
              <div className="grid gap-3">
                <div className="relative h-40 overflow-hidden rounded-xl border">
                  <Image
                    src={variantThumbnailPreview}
                    alt="Variant thumbnail"
                    fill
                    className="object-cover"
                  />
                </div>
                <div
                  className="text-muted-foreground flex min-h-24 cursor-pointer items-center justify-center rounded-xl border border-dashed text-sm"
                  onClick={() => variantThumbnailInputRef.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    void handleVariantThumbnailFiles(event.dataTransfer.files);
                  }}>
                  Drag & drop variant thumbnail or click to upload
                </div>
                <input
                  ref={variantThumbnailInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => void handleVariantThumbnailFiles(event.target.files)}
                />
                <Input
                  id="variant_thumbnail"
                  name="variant.thumbnail"
                  placeholder="Variant thumbnail URL"
                  value={formik.values.variant.thumbnail}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.variant?.thumbnail && formik.errors.variant?.thumbnail
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                />
                {formik.touched.variant?.thumbnail && formik.errors.variant?.thumbnail && (
                  <p className="text-xs text-red-500">{formik.errors.variant?.thumbnail}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
};
