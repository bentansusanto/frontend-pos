"use client";

import {
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  Eye,
  Filter,
  Loader2,
  PencilLine,
  Plus,
  Search,
  Trash2,
  XCircle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

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
import { Button } from "@/components/ui/button";
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
import { useGetProfileQuery } from "@/store/services/auth.service";
import { useGetBranchesQuery } from "@/store/services/branch.service";
import { useGetAllCategoriesQuery } from "@/store/services/category.service";
import { useDeleteProductMutation, useGetProductsQuery } from "@/store/services/product.service";
import { getCookie } from "@/utils/cookies";
import { useEffect, useMemo, useState } from "react";
import AddStockDialog from "./AddStock/AddStockDialog";

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

export const ProductPage = () => {
  const { data: profileData } = useGetProfileQuery();
  const { data: branchesData } = useGetBranchesQuery();

  const userRole = profileData?.data?.role;
  const userBranches = profileData?.data?.branches || [];

  const [selectedBranchId, setSelectedBranchId] = useState<string>(() => {
    return getCookie("pos_branch_id") || "all";
  });

  const availableBranches = useMemo(() => {
    if (!branchesData?.data) return [];
    if (userRole === "owner" || userRole === "super_admin") {
      return branchesData.data;
    }
    // For restricted users, filter branches based on assignment
    const filtered = branchesData.data.filter((branch: any) =>
      userBranches.some((ub: any) => ub.id === branch.id)
    );
    return filtered;
  }, [branchesData, userRole, userBranches]);

  useEffect(() => {
    if (availableBranches.length > 0) {
      // If user is restricted (not owner/admin), force select the first available branch if "all" is selected or empty
      if (
        userRole !== "owner" &&
        userRole !== "super_admin" &&
        (selectedBranchId === "all" || !selectedBranchId)
      ) {
        setSelectedBranchId(availableBranches[0].id);
      }
    }
  }, [availableBranches, selectedBranchId, userRole]);

  const {
    data: productsData,
    isLoading,
    refetch
  } = useGetProductsQuery(
    selectedBranchId && selectedBranchId !== "all" ? { branch_id: selectedBranchId } : undefined
  );
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({ key: "name_product", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc"
    }));
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return {
        label: "Out of Stock",
        value: "out",
        className: "bg-rose-100 text-rose-600 hover:bg-rose-100"
      };
    if (stock < 10)
      return {
        label: "Low Stock",
        value: "low",
        className: "bg-amber-100 text-amber-600 hover:bg-amber-100"
      };
    return {
      label: "In Stock",
      value: "in-stock",
      className: "bg-emerald-100 text-emerald-600 hover:bg-emerald-100"
    };
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id).unwrap();
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    }
  };

  const filteredProducts = products
    .filter((product: any) => {
      // Search filter
      const matchesSearch =
        product.name_product.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.category_name &&
          product.category_name.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory =
        selectedCategory === "all" || product.category_id === selectedCategory;

      // Status filter
      const status = getStockStatus(product.stock || 0);
      const matchesStatus = selectedStatus === "all" || status.value === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a: any, b: any) => {
      const { key, direction } = sortConfig;

      let aValue = a[key];
      let bValue = b[key];

      // Handle nested or special fields
      if (key === "price" || key === "stock") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            Inventory Product List
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Manage your storefront catalog and monitor real-time stock availability.
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:justify-end">
          <div className="relative w-full sm:w-64">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search products, SKUs, or categories..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <AddStockDialog onStockAdded={refetch} />
          <Button className="gap-2" asChild>
            <Link href="/dashboard/inventory/products/add">
              <Plus className="size-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-background flex items-center gap-4 rounded-xl border px-4 py-3 shadow-sm">
              <div className={`flex size-11 items-center justify-center rounded-xl ${item.tone}`}>
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{item.title}</p>
                <div className="flex items-end gap-2">
                  <p className="text-xl font-semibold text-slate-900">{item.value}</p>
                  <span className="text-xs text-slate-400">{item.helper}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-950">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            {(userRole === "owner" ||
              userRole === "super_admin" ||
              availableBranches.length > 1) && (
              <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  {(userRole === "owner" || userRole === "super_admin") && (
                    <SelectItem value="all">All Branches</SelectItem>
                  )}
                  {availableBranches.map((branch: any) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedStatus("all");
              setSortConfig({ key: "name_product", direction: "asc" });
            }}>
            <Filter className="size-4" />
            Reset Filter
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => handleSort("name_product")}>
                  <div className="flex items-center gap-2">
                    Product
                    {sortConfig.key === "name_product" && (
                      <ArrowUpDown className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                </TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => handleSort("price")}>
                  <div className="flex items-center gap-2">
                    Price
                    {sortConfig.key === "price" && (
                      <ArrowUpDown className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => handleSort("stock")}>
                  <div className="flex items-center gap-2">
                    Stock
                    {sortConfig.key === "stock" && (
                      <ArrowUpDown className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                      <span className="text-slate-500">Loading products...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product: any) => {
                  const stockStatus = getStockStatus(product.stock || 0);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative size-10 overflow-hidden rounded-lg border">
                            <Image
                              src={product.thumbnail || "/placeholder-image.jpg"}
                              alt={product.name_product}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{product.name_product}</p>
                            <p className="text-xs text-slate-500">
                              Updated {new Date(product.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{product.sku}</TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {product.category_name}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-900">
                        ${Number(product.price).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{product.stock || 0}</TableCell>
                      <TableCell>
                        <Badge className={stockStatus.className}>{stockStatus.label}</Badge>
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="icon" variant="ghost" asChild>
                            <Link href={`/dashboard/inventory/products/${product.id}`}>
                              <Eye className="size-4" />
                            </Link>
                          </Button>
                          <Button size="icon" variant="ghost" asChild>
                            <Link href={`/dashboard/inventory/products/${product.id}/edit`}>
                              <PencilLine className="size-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" disabled={isDeleting}>
                                <Trash2 className="size-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete{" "}
                                  <span className="font-semibold text-slate-900">
                                    "{product.name_product}"
                                  </span>
                                  ? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDelete(product.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-slate-500">
            Showing {products.length > 0 ? 1 : 0} to {products.length} of {products.length} entries
          </p>
          <Pagination className="mx-0 w-auto justify-end">
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
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
};
