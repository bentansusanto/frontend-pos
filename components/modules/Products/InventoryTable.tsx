"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, MoreHorizontal, PencilLine, Trash2, Eye, Printer, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { BarcodeLabel } from "@/components/modules/Inventory/Barcode/BarcodeLabel";

interface InventoryTableProps {
  products: any[];
  isLoading: boolean;
  onDelete?: (id: string) => void;
  userRole?: string;
  isDeleting?: boolean;
}

export function InventoryTable({
  products,
  isLoading,
  onDelete,
  userRole,
  isDeleting,
}: InventoryTableProps) {
  const [expandedProduct, setExpandedProduct] = React.useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-muted-foreground">Loading inventory data...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-muted-foreground">No products found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-center">Variants</TableHead>
            <TableHead className="text-center">Total Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const variants = product.variants || [];
            const totalStock = variants.reduce((s: number, v: any) => s + (Number(v.stock) || 0), 0);
            const hasOutOfStock = variants.some((v: any) => (Number(v.stock) || 0) <= 0);
            const hasLowStock = variants.some(
              (v: any) => (Number(v.stock) || 0) > 0 && (Number(v.stock) || 0) < 10
            );
            const isExpanded = expandedProduct === product.id;

            return (
              <React.Fragment key={product.id}>
                <TableRow
                  className={`group cursor-pointer transition-colors hover:bg-muted/50 ${
                    hasOutOfStock ? "bg-rose-50/30" : hasLowStock ? "bg-amber-50/30" : ""
                  }`}
                  onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                >
                  <TableCell className="w-8">
                    <ChevronRight
                      className={`size-4 text-muted-foreground transition-transform duration-200 ${
                        isExpanded ? "rotate-90 text-foreground" : ""
                      }`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 overflow-hidden rounded-lg border bg-muted">
                        <Image
                          src={product.thumbnail || "/placeholder-image.jpg"}
                          alt={product.name_product}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {product.name_product}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {product.sku}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {product.category_name || "Uncategorized"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm font-medium">
                    {variants.length}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`text-sm font-bold ${
                        totalStock <= 0
                          ? "text-rose-600"
                          : hasLowStock
                          ? "text-amber-600"
                          : "text-foreground"
                      }`}
                    >
                      {totalStock}
                    </span>
                  </TableCell>
                  <TableCell>
                    {totalStock <= 0 ? (
                      <Badge variant="destructive" className="h-5 px-1.5 text-[10px] uppercase tracking-wider">
                        Out of Stock
                      </Badge>
                    ) : hasLowStock ? (
                      <Badge className="h-5 bg-amber-100 px-1.5 text-[10px] whitespace-nowrap uppercase tracking-wider text-amber-700 hover:bg-amber-100">
                        Low Stock
                      </Badge>
                    ) : (
                      <Badge variant="default" className="h-5 px-1.5 text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none shadow-none">
                        In Stock
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-40"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuItem asChild onClick={(e) => e.stopPropagation()}>
                          <Link href={`/dashboard/inventory/products/${product.id}`}>
                            <Eye className="mr-2 size-4" /> View Details
                          </Link>
                        </DropdownMenuItem>
                        {userRole !== "cashier" && (
                          <>
                            <DropdownMenuItem asChild onClick={(e) => e.stopPropagation()}>
                              <Link href={`/dashboard/inventory/products/${product.id}/edit`}>
                                <PencilLine className="mr-2 size-4" /> Edit Product
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-rose-600 focus:bg-rose-50 focus:text-rose-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.(product.id);
                              }}
                              disabled={isDeleting}
                            >
                              <Trash2 className="mr-2 size-4" /> Delete Product
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>

                {/* Expanded variant rows */}
                {isExpanded &&
                  variants.map((variant: any) => (
                    <TableRow key={variant.id} className="bg-muted/30 hover:bg-muted/40 border-l-2 border-l-primary/30">
                      <TableCell></TableCell>
                      <TableCell className="pl-10">
                        <div className="flex items-center gap-3">
                           <div className="relative size-8 overflow-hidden rounded-md border bg-background">
                            <Image
                              src={variant.thumbnail || "/placeholder-image.jpg"}
                              alt={variant.name_variant}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-foreground">
                              {variant.name_variant}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground uppercase">
                              SKU: {variant.sku}
                            </span>
                            {variant.barcode && (
                              <span className="font-mono text-[10px] text-primary/70 uppercase">
                                BAR: {variant.barcode}
                              </span>
                            )}
                          </div>
                         </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5 text-[11px]">
                          <span className="font-medium text-foreground">
                            Sell: {Number(variant.price).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}
                          </span>
                          <span className="text-muted-foreground">
                            Cost: {Number(variant.cost_price || 0).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-xs text-muted-foreground font-medium">
                        {/* Box configuration if available, otherwise just dash */}
                        -
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`text-xs font-bold ${
                            Number(variant.stock) <= 0
                              ? "text-rose-600"
                              : Number(variant.stock) < 10
                              ? "text-amber-600"
                              : "text-foreground"
                          }`}
                        >
                          {variant.stock || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            Number(variant.stock) <= 0
                              ? "destructive"
                              : Number(variant.stock) < 10
                              ? "secondary"
                              : "default"
                          }
                          className={`h-4 px-1.5 text-[9px] uppercase tracking-tighter ${
                            Number(variant.stock) > 0 && Number(variant.stock) < 10
                              ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                              : Number(variant.stock) > 0 
                                ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-none"
                                : ""
                          }`}
                        >
                          {Number(variant.stock) <= 0
                            ? "Out"
                            : Number(variant.stock) < 10
                            ? "Low"
                            : "OK"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-primary"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Printer className="size-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-lg font-black uppercase tracking-tight">Print SKU Label</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col items-center justify-center py-10 space-y-6 printable-label">
                               <BarcodeLabel 
                                 productName={product.name_product}
                                 variantName={variant.name_variant}
                                 sku={variant.sku}
                                 price={variant.price}
                               />
                               <div className="text-center space-y-2 print:hidden">
                                  <p className="text-xs text-muted-foreground font-medium">Ready to print?</p>
                                  <Button 
                                    onClick={() => window.print()}
                                    className="rounded-xl font-black uppercase tracking-widest text-[10px] px-8"
                                  >
                                    <Printer className="mr-2 size-4" /> Start Print
                                  </Button>
                               </div>
                            </div>
                            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground print:hidden">
                              <X className="h-4 w-4" />
                              <span className="sr-only">Close</span>
                            </DialogClose>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
