"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  History,
  Package,
  Plus,
  Search,
  Tag,
  Timer,
  XCircle
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useGetProductBatchesQuery } from "@/store/services/product-batch.service";
import { useGetBranchesQuery } from "@/store/services/branch.service";
import { useGetProfileQuery } from "@/store/services/auth.service";
import { useGetProductsQuery, useGetVariantProductsQuery } from "@/store/services/product.service";
import { useGetSuppliersQuery } from "@/store/services/supplier.service";
import { getCookie } from "@/utils/cookies";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import CreateBatchDialog from "./ProductBatch/CreateBatchDialog";
import ProductBatchDetail from "./ProductBatch/ProductBatchDetail";
import { mockProductBatches } from "@/data/mockProductBatches";

export const ProductBatchPage = () => {
  const { data: profile } = useGetProfileQuery();
  const { data: branches, isLoading: isLoadingBranches } = useGetBranchesQuery();
  const { data: products, isLoading: isLoadingProducts } = useGetProductsQuery();
  const { data: variants, isLoading: isLoadingVariants } = useGetVariantProductsQuery();
  const { data: suppliers, isLoading: isLoadingSuppliers } = useGetSuppliersQuery();
  
  const [selectedBranchId, setSelectedBranchId] = useState<string>(() => {
    return getCookie("pos_branch_id") || "all";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Lookup maps
  const branchMap = useMemo(() => {
    const map = new Map();
    branches?.forEach((b: any) => map.set(b.id, b));
    return map;
  }, [branches]);

  const productMap = useMemo(() => {
    const map = new Map();
    products?.forEach((p: any) => map.set(p.id, p));
    return map;
  }, [products]);

  const variantMap = useMemo(() => {
    const map = new Map();
    variants?.forEach((v: any) => {
      const product = productMap.get(v.product_id);
      map.set(v.id, { ...v, product });
    });
    return map;
  }, [variants, productMap]);

  const supplierMap = useMemo(() => {
    const map = new Map();
    suppliers?.forEach((s: any) => map.set(s.id, s));
    return map;
  }, [suppliers]);

  const handleRowClick = useCallback((batch: any) => {
    setSelectedBatch(batch);
    setShowDetail(true);
  }, []);

  const { data: apiBatches, isLoading: isLoadingBatches, refetch } = useGetProductBatchesQuery(
    selectedBranchId !== "all" ? { branch_id: selectedBranchId } : undefined
  );

  const batches = apiBatches && apiBatches.length > 0 ? apiBatches : mockProductBatches;

  const filteredBatches = useMemo(() => {
    if (!batches) return [];
    return batches.map((batch: any) => {
      // Enrich batch with relational data for easier UI access
      const variant = variantMap.get(batch.productVariantId);
      const branch = branchMap.get(batch.branchId);
      const supplier = supplierMap.get(batch.supplierId);
      
      return {
        ...batch,
        productVariant: variant || batch.productVariant,
        branch: branch || batch.branch,
        supplier: supplier || batch.supplier,
      };
    }).filter((batch: any) => {
      const productName = batch.productVariant?.product?.name_product || "";
      const variantName = batch.productVariant?.name_variant || "";
      
      const matchesSearch = 
        batch.batchNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        variantName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || batch.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [batches, searchQuery, statusFilter, variantMap, branchMap, supplierMap]);

  const isLoading = isLoadingBatches || isLoadingVariants || isLoadingProducts || isLoadingBranches || isLoadingSuppliers;

  const stats = useMemo(() => {
    if (!batches) return { total: 0, active: 0, expired: 0, expiringSoon: 0 };
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    return batches.reduce((acc: any, batch: any) => {
      acc.total++;
      if (batch.status === "active") acc.active++;
      if (batch.status === "expired") acc.expired++;
      
      if (batch.expiryDate) {
        const expiry = new Date(batch.expiryDate);
        if (expiry > now && expiry <= thirtyDaysFromNow) {
          acc.expiringSoon++;
        }
      }
      return acc;
    }, { total: 0, active: 0, expired: 0, expiringSoon: 0 });
  }, [batches]);

  const getStatusBadge = (status: string, expiryDate?: string) => {
    const now = new Date();
    const expiry = expiryDate ? new Date(expiryDate) : null;
    
    if (status === "expired" || (expiry && expiry < now)) {
      return <Badge variant="destructive" className="gap-1"><XCircle className="size-3" /> Expired</Badge>;
    }
    
    if (expiry) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);
      if (expiry <= thirtyDaysFromNow) {
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1"><AlertCircle className="size-3" /> Expiring Soon</Badge>;
      }
    }

    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1"><CheckCircle2 className="size-3" /> Active</Badge>;
      case "hold":
        return <Badge variant="secondary" className="gap-1"><Timer className="size-3" /> On Hold</Badge>;
      case "sold_out":
        return <Badge variant="outline" className="gap-1">Sold Out</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Batches</h1>
          <p className="text-muted-foreground">Track and manage product batches, expiry dates, and specific batch costs.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
                <History className="size-4" />
                History
            </Button>
            <CreateBatchDialog onBatchAdded={refetch} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <Package className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all filtered categories</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-primary/20" />
        </Card>
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Stock</CardTitle>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">Available for sale</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-emerald-500/20" />
        </Card>
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground mt-1">Within next 30 days</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-amber-500/20" />
        </Card>
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <XCircle className="size-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.expired}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires immediate action</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-destructive/20" />
        </Card>
      </div>

      <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex flex-1 items-center gap-2 max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search batch number or product..."
                  className="pl-9 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches?.map((branch: any) => (
                    <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-white">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="hold">On Hold</SelectItem>
                  <SelectItem value="sold_out">Sold Out</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" className="bg-white">
                <Filter className="size-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold">Batch Info</TableHead>
                  <TableHead className="font-semibold">Product</TableHead>
                  <TableHead className="font-semibold">Quantity</TableHead>
                  <TableHead className="font-semibold text-right">Cost Price</TableHead>
                  <TableHead className="font-semibold">Expiry Date</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-24 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredBatches.length > 0 ? (
                  filteredBatches.map((batch: any) => (
                    <TableRow 
                      key={batch.id} 
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      onClick={() => handleRowClick(batch)}
                    >
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-slate-900 group-hover:text-primary transition-colors">
                            {batch.batchNumber || "BN-" + batch.id.substring(0, 6)}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="size-3" />
                            Rec: {batch.receivedDate ? format(new Date(batch.receivedDate), "dd MMM yyyy") : "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{batch.productVariant?.product?.name_product}</span>
                          <span className="text-xs text-muted-foreground">{batch.productVariant?.name_variant}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-slate-700">{batch.currentQuantity} <span className="text-xs font-normal text-slate-500">of {batch.initialQuantity}</span></span>
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${Math.min(100, (batch.currentQuantity / batch.initialQuantity) * 100)}%` }} 
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        $ {Number(batch.costPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-2 ${
                          new Date(batch.expiryDate) < new Date() ? "text-destructive font-semibold" : "text-slate-600"
                        }`}>
                          <Timer className="size-4" />
                          {batch.expiryDate ? format(new Date(batch.expiryDate), "dd MMM yyyy") : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(batch.status, batch.expiryDate)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No product batches found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <ProductBatchDetail 
        batch={selectedBatch} 
        open={showDetail} 
        onOpenChange={setShowDetail} 
      />
    </div>
  );
};
