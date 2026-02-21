"use client";

import Image from "next/image";
import Link from "next/link";

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
import { useGetProductByIdQuery } from "@/store/services/product.service";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

export const ProductDetails = () => {
  const params = useParams();
  const productId = params.productId as string;
  const { data: productData, isLoading } = useGetProductByIdQuery(productId, {
    skip: !productId
  });
  const product = productData?.data;

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

  return (
    <div className="space-y-6">
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
                  <p className="text-sm text-slate-500">Product Name</p>
                  <p className="text-lg font-semibold text-slate-900">{product.name_product}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Category</p>
                  <Badge className="mt-2 w-fit">{product.category_name || "Uncategorized"}</Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Description</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {product.description || "No description available."}
                  </p>
                </div>
              </div>
              <div className="space-y-3 rounded-xl border p-4">
                <p className="text-sm text-slate-500">Pricing</p>
                <p className="text-2xl font-semibold text-slate-900">
                  ${Number(product.price).toLocaleString()}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span>SKU: {product.sku}</span>
                  <span>·</span>
                  <span>Slug: {product.slug}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span className="text-slate-500">Stock</span>
                  <span className="font-medium text-slate-900">{product.stock || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Variants</CardTitle>
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
                          <TableCell className="font-medium text-slate-900">
                            {variant.name_variant}
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">{variant.sku}</TableCell>
                          <TableCell className="text-sm text-slate-500">
                            ${Number(variant.price).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {variant.stock || 0}
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
