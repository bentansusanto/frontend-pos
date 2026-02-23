"use client";

import Image from "next/image";
import Link from "next/link";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  useDeleteVariantProductMutation,
  useGetProductByIdQuery
} from "@/store/services/product.service";
import { getCookie } from "@/utils/cookies";
import { Edit, Loader2, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { useState } from "react";
import { AddVariantDialog } from "./AddVariant/AddVariantDialog";
import { UpdateVariantDialog } from "./UpdateVariant/UpdateVariantDialog";

export const ProductDetails = () => {
  const [isAddVariantOpen, setIsAddVariantOpen] = useState(false);
  const [isUpdateVariantOpen, setIsUpdateVariantOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  const params = useParams();
  const productId = params.productId as string;
  const cookieValue = getCookie("pos_branch_id");
  const branchId = cookieValue ? cookieValue : undefined;
  const {
    data: productData,
    isLoading,
    refetch
  } = useGetProductByIdQuery(
    { id: productId, branch_id: branchId },
    {
      skip: !productId
    }
  );
  const [deleteVariantProduct] = useDeleteVariantProductMutation();

  const product = productData?.data;

  const handleEditVariant = (variant: any) => {
    setSelectedVariant(variant);
    setIsUpdateVariantOpen(true);
  };

  const handleDeleteVariant = async (variantId: string) => {
    try {
      await deleteVariantProduct({ id: variantId }).unwrap();
      toast.success("Variant deleted successfully");
      refetch();
    } catch (error: any) {
      toast.error("Failed to delete variant");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-96 w-full items-center justify-center text-slate-500">
        Product not found
      </div>
    );
  }

  const productImages = [product.thumbnail, ...(product.images || [])].filter(Boolean);
  const variants = product.variants || [];

  const productStock = typeof product.product_stock === "number" ? product.product_stock : 0;

  return (
    <div className="space-y-6">
      <AddVariantDialog
        open={isAddVariantOpen}
        onOpenChange={setIsAddVariantOpen}
        productId={productId}
        onSuccess={refetch}
      />
      <UpdateVariantDialog
        open={isUpdateVariantOpen}
        onOpenChange={setIsUpdateVariantOpen}
        variantId={selectedVariant?.id || ""}
        productId={productId}
        initialData={selectedVariant}
        onSuccess={refetch}
      />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Product Detail</h1>
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
                <BreadcrumbPage>Product Detail</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/inventory/products">Back to List</Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/inventory/products/${productId}/edit`}>Edit Product</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Product Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[1fr_240px]">
              <div className="space-y-4">
                <div>
                  <p className="text-muted-foreground text-sm">Product Name</p>
                  <p className="text-foreground text-lg font-semibold">{product.name_product}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Category</p>
                  <Badge className="mt-2 w-fit">{product.category_name || "Uncategorized"}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Description</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {product.description || "No description available."}
                  </p>
                </div>
              </div>
              <div className="space-y-3 rounded-xl border p-4">
                <p className="text-muted-foreground text-sm">Pricing</p>
                <p className="text-foreground text-2xl font-semibold">
                  ${Number(product.price).toLocaleString()}
                </p>
                <div className="text-muted-foreground flex flex-wrap gap-2 text-xs">
                  <span>SKU: {product.sku}</span>
                  <span>·</span>
                  <span>Slug: {product.slug}</span>
                  <span>·</span>
                  <span>Stock: {productStock}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Variants</CardTitle>
              <Button size="sm" onClick={() => setIsAddVariantOpen(true)}>
                Add Variant
              </Button>
            </CardHeader>
            <CardContent>
              {variants.length > 0 ? (
                <div className="overflow-hidden rounded-xl border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Thumbnail</TableHead>
                        <TableHead>Variant</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {variants.map((variant: any) => (
                        <TableRow key={variant.id}>
                          <TableCell>
                            <div className="relative h-12 w-12 overflow-hidden rounded-lg border">
                              <Image
                                src={variant.thumbnail || "/placeholder.svg"}
                                alt={variant.name_variant}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground font-medium">
                            {variant.name_variant}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {variant.sku}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            ${Number(variant.price).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {variant.stock || 0}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditVariant(variant)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Variant?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete{" "}
                                      <span className="text-foreground font-semibold">
                                        "{variant.name_variant}"
                                      </span>
                                      ? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() => handleDeleteVariant(variant.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-sm text-slate-500">No variants available.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Product Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative h-48 overflow-hidden rounded-xl border">
                <Image
                  src={productImages[0] || "/placeholder-image.jpg"}
                  alt="Product preview"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {productImages.map((image: string, index: number) => (
                  <div
                    key={`${image}-${index}`}
                    className="relative h-20 overflow-hidden rounded-lg border">
                    <Image src={image} alt="Product media" fill className="object-cover" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
