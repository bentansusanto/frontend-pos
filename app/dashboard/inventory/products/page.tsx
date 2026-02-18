"use client";

import Image from "next/image";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Filter,
  PencilLine,
  Plus,
  Search,
  Trash2,
  XCircle
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const stats = [
  {
    title: "In Stock",
    value: "1,420",
    helper: "Items",
    tone: "bg-emerald-100 text-emerald-600",
    icon: CheckCircle2
  },
  {
    title: "Low Inventory",
    value: "18",
    helper: "Items",
    tone: "bg-amber-100 text-amber-600",
    icon: AlertTriangle
  },
  {
    title: "Out of Stock",
    value: "3",
    helper: "Items",
    tone: "bg-rose-100 text-rose-600",
    icon: XCircle
  }
];

const products = [
  {
    name: "Premium Wireless Headphones",
    sku: "SKU-10293",
    category: "Electronics",
    price: "$249.00",
    stock: 150,
    status: "In Stock",
    badge: "bg-emerald-100 text-emerald-600",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop"
  },
  {
    name: "Minimalist Analog Watch",
    sku: "SKU-10294",
    category: "Electronics",
    price: "$89.00",
    stock: 12,
    status: "Low Stock",
    badge: "bg-amber-100 text-amber-600",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop"
  },
  {
    name: "Sport Performance Sneakers",
    sku: "SKU-20551",
    category: "Apparel",
    price: "$120.00",
    stock: 0,
    status: "Out of Stock",
    badge: "bg-rose-100 text-rose-600",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop"
  },
  {
    name: "Professional Stand Mixer",
    sku: "SKU-30992",
    category: "Home & Kitchen",
    price: "$499.00",
    stock: 45,
    status: "In Stock",
    badge: "bg-emerald-100 text-emerald-600",
    image:
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?q=80&w=400&auto=format&fit=crop"
  }
];

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Inventory Product List</h3>
          <p className="text-slate-500 text-sm mt-1">
            Manage your storefront catalog and monitor real-time stock availability.
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:justify-end">
          <div className="relative w-full sm:w-64">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input placeholder="Search products, SKUs, or categories..." className="pl-9" />
          </div>
          <Button className="gap-2">
            <Plus className="size-4" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="flex items-center gap-4 rounded-xl border bg-background px-4 py-3 shadow-sm">
              <div className={`flex size-11 items-center justify-center rounded-xl ${item.tone}`}>
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-semibold uppercase">
                  {item.title}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-semibold">{item.value}</span>
                  <span className="text-muted-foreground text-xs">{item.helper}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 rounded-xl border bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-52">
              <Filter className="text-muted-foreground size-4" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="apparel">Apparel</SelectItem>
              <SelectItem value="home">Home & Kitchen</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="newest">
            <SelectTrigger className="w-full sm:w-52">
              <span className="text-muted-foreground text-xs">Sort by:</span>
              <SelectValue placeholder="Newest" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="price-high">Price: High</SelectItem>
              <SelectItem value="price-low">Price: Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="link" className="h-auto px-0 text-sm sm:ml-auto">
          Clear all filters
        </Button>
      </div>

      <div className="space-y-4 rounded-xl border bg-background px-4 py-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[280px]">Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.sku}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 overflow-hidden rounded-xl border">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{product.name}</p>
                            <p className="text-muted-foreground text-xs">Black Edition</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {product.sku}
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="font-semibold">{product.price}</TableCell>
                      <TableCell className={product.stock === 0 ? "text-rose-600" : ""}>
                        {product.stock}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${product.badge} font-normal`} variant="secondary">
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <PencilLine className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex flex-col items-start justify-between gap-4 border-t pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center">
                <span>Showing 1 to 4 of 24 results</span>
                <Pagination className="mx-0 w-auto">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>
                        1
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
      </div>
    </div>
  );
}
