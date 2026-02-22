"use client";

import { X } from "lucide-react";
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

import { HooksAddProduct } from "./hooks";

export const AddProduct = () => {
  const {
    formik,
    categories,
    isCategoriesLoading,
    isSubmitting,
    isCreatingCategory,
    handleCreateCategory
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
    const existingImages = parseImagesValue(formik.values.product.images);
    await formik.setFieldValue(
      "product.images",
      stringifyImagesValue([...existingImages, ...dataUrls])
    );
    const existingFiles = formik.values.product.imageFiles || [];
    await formik.setFieldValue("product.imageFiles", [...existingFiles, files[0]]);
  };

  const productThumbnailPreview = isValidImageSrc(formik.values.product.thumbnail)
    ? formik.values.product.thumbnail
    : "";
  const parsedProductImages = parseImagesValue(formik.values.product.images);
  const productImagesPreview = parsedProductImages.filter(isValidImageSrc);

  const handleRemoveProductImage = (indexToRemove: number) => {
    const remainingImages = parsedProductImages.filter((_, index) => index !== indexToRemove);
    void formik.setFieldValue("product.images", stringifyImagesValue(remainingImages));
    const currentFiles = formik.values.product.imageFiles || [];
    const remainingFiles = currentFiles.filter((_: any, index: number) => index !== indexToRemove);
    void formik.setFieldValue("product.imageFiles", remainingFiles);
  };

  return (
    <form className="space-y-6" onSubmit={formik.handleSubmit} encType="multipart/form-data">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Add Product</h1>
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
                <BreadcrumbPage>Add Product</BreadcrumbPage>
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
            Add Product
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
            <CardContent className="grid gap-4 lg:grid-cols-2">
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
              <div className="space-y-2 lg:col-span-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      disabled={isCreatingCategory}>
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                      <Label htmlFor="category-name">Category Name</Label>
                      <Input
                        id="category-name"
                        placeholder="Type category name"
                        value={categoryName}
                        onChange={(event) => setCategoryName(event.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                          onClick={handleCategoryCreate}
                          disabled={isCreatingCategory || !categoryName.trim()}>
                          Create Category
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
                  {productThumbnailPreview ? (
                    <Image
                      src={productThumbnailPreview}
                      alt="Thumbnail product"
                      fill
                      className="object-cover"
                    />
                  ) : null}
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
        </div>
      </div>
    </form>
  );
};
