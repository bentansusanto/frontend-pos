"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Filter,
  Package,
  Plus,
  Search,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
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
import { useGetProfileQuery } from "@/store/services/auth.service";
import { useGetBranchesQuery } from "@/store/services/branch.service";
import { useGetAllCategoriesQuery } from "@/store/services/category.service";
import { useDeleteProductMutation, useGetProductsQuery } from "@/store/services/product.service";
import { getCookie } from "@/utils/cookies";
import React, { useEffect, useMemo, useState } from "react";
import AddStockDialog from "./AddStock/AddStockDialog";
import { InventoryTable } from "./InventoryTable";
import { useSocket } from "@/components/providers/socket-provider";

export const ProductPage = () => {
  const { data: profileData } = useGetProfileQuery();
  const { data: branchesData } = useGetBranchesQuery();

  const userRole = profileData?.role;
  const userBranches = profileData?.branches || [];

  const [selectedBranchId, setSelectedBranchId] = useState<string>(() => {
    return getCookie("pos_branch_id") || "all";
  });

  const availableBranches = useMemo(() => {
    if (!branchesData) return [];
    if (userRole === "owner" || userRole === "super_admin") {
      return branchesData;
    }
    // For restricted users, filter branches based on assignment
    const filtered = branchesData.filter((branch: any) =>
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
  const products = productsData || [];
  const categories = categoriesData || [];
  const { socket } = useSocket();

  // Listen for real-time stock updates from WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleStockUpdate = () => {
      refetch();
    };

    socket.on("stock_updated", handleStockUpdate);

    return () => {
      socket.off("stock_updated", handleStockUpdate);
    };
  }, [socket, refetch]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
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

  const selectedBranchName = useMemo(() => {
    if (selectedBranchId === "all") return "All Branches";
    return availableBranches.find((b: any) => b.id === selectedBranchId)?.name || "Branch";
  }, [selectedBranchId, availableBranches]);

  const stockStats = useMemo(() => {
    const counts = products.reduce(
      (acc: { inStock: number; low: number; out: number }, product: any) => {
        const variants = product.variants || [];
        if (variants.length === 0) return acc;

        variants.forEach((v: any) => {
          const stock = typeof v.stock === "number" ? v.stock : 0;
          if (stock <= 0) {
            acc.out += 1;
          } else if (stock < 10) {
            acc.low += 1;
          } else {
            acc.inStock += 1;
          }
        });
        return acc;
      },
      { inStock: 0, low: 0, out: 0 }
    );

    return [
      {
        title: "In Stock",
        value: counts.inStock.toLocaleString(),
        helper: `In ${selectedBranchName}`,
        tone: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
        icon: CheckCircle2
      },
      {
        title: "Low Inventory",
        value: counts.low.toLocaleString(),
        helper: "Requires Attention",
        tone: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
        icon: AlertTriangle
      },
      {
        title: "Out of Stock",
        value: counts.out.toLocaleString(),
        helper: "Immediate Action",
        tone: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
        icon: XCircle
      }
    ];
  }, [products, selectedBranchName]);

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

      return matchesSearch && matchesCategory;
    })
    .sort((a: any, b: any) => {
      const { key, direction } = sortConfig;

      let aValue = a[key];
      let bValue = b[key];

      // Handle nested or special fields
      if (key === "price") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const indexOfFirstItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="space-y-6">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-foreground text-2xl font-bold">Inventory Product List</h3>
          <p className="text-muted-foreground mt-1 text-sm">
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
          {userRole !== "cashier" && (
            <>
              <AddStockDialog onStockAdded={refetch} />
              <Button className="gap-2" asChild>
                <Link href="/dashboard/inventory/products/add">
                  <Plus className="size-4" />
                  Add Product
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Products Card */}
        <Card className="rounded-xl border bg-white shadow-sm ring-1 ring-slate-200/50">
          <CardContent>
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-slate-500">Total Products</p>
              <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
                <Package className="size-6" />
              </div>
            </div>
            <div className="flex flex-col gap-0.5 mt-1">
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {products.length.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">
                {products.reduce((acc: number, p: any) => acc + (p.variants?.length || 0), 0)}{" "}
                variants in {selectedBranchName}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* In Stock Card */}
        <Card className="rounded-xl border bg-white shadow-sm ring-1 ring-slate-200/50">
          <CardContent>
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-slate-500">In Stock</p>
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <CheckCircle2 className="size-6" />
              </div>
            </div>
            <div className="flex flex-col gap-0.5 mt-1">
              <p className="text-2xl font-bold tracking-tight text-emerald-600">
                {products.reduce(
                  (acc: number, p: any) =>
                    acc + (p.variants?.filter((v: any) => v.stock >= 10).length || 0),
                  0
                )}{" "}
                variants
              </p>
              <p className="text-xs text-slate-500">Ready for Sale in {selectedBranchName}</p>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Card */}
        <Card className="rounded-xl border bg-white shadow-sm ring-1 ring-slate-200/50">
          <CardContent>
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-slate-500">Low Stock</p>
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <AlertTriangle className="size-6" />
              </div>
            </div>
            <div className="flex flex-col gap-0.5 mt-1">
              <p className="text-2xl font-bold tracking-tight text-amber-600">
                {products.reduce(
                  (acc: number, p: any) =>
                    acc + (p.variants?.filter((v: any) => v.stock > 0 && v.stock < 10).length || 0),
                  0
                )}{" "}
                variants
              </p>
              <p className="text-xs text-slate-500">Requires attention in {selectedBranchId === "all" ? "Inventory" : selectedBranchName}</p>
            </div>
          </CardContent>
        </Card>

        {/* Out of Stock Card */}
        <Card className="rounded-xl border bg-white shadow-sm ring-1 ring-slate-200/50">
          <CardContent>
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-slate-500">Out of Stock</p>
              <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
                <XCircle className="size-6" />
              </div>
            </div>
            <div className="flex flex-col gap-0.5 mt-1">
              <p className="text-2xl font-bold tracking-tight text-rose-600">
                {products.reduce(
                  (acc: number, p: any) =>
                    acc + (p.variants?.filter((v: any) => v.stock <= 0).length || 0),
                  0
                )}{" "}
                variants
              </p>
              <p className="text-xs text-slate-500">Immediate action needed</p>
            </div>
          </CardContent>
        </Card>
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
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSortConfig({ key: "name_product", direction: "asc" });
            }}>
            <Filter className="size-4" />
            Reset Filter
          </Button>
        </div>

        <InventoryTable
          products={paginatedProducts}
          isLoading={isLoading}
          onDelete={handleDelete}
          userRole={userRole}
          isDeleting={isDeleting}
        />

        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-muted-foreground text-sm">
            Showing {indexOfFirstItem} to {indexOfLastItem} of {totalItems} entries
          </p>
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                })
                .map((page, index, array) => {
                  const prevPage = array[index - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;

                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}>
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    </React.Fragment>
                  );
                })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  className={
                    currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
};
