"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  History,
  Package,
  Pencil,
  Plus,
  Search,
  Tag,
  Timer,
  Trash2,
  XCircle,
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
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetProductBatchesQuery } from "@/store/services/product-batch.service";
import { useGetBranchesQuery } from "@/store/services/branch.service";
import { useGetProductsQuery, useGetVariantProductsQuery } from "@/store/services/product.service";
import { useGetSuppliersQuery } from "@/store/services/supplier.service";
import { getCookie } from "@/utils/cookies";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import CreateBatchDialog from "./ProductBatch/CreateBatchDialog";
import ProductBatchDetail from "./ProductBatch/ProductBatchDetail";
import EditBatchDialog from "./ProductBatch/EditBatchDialog";
import DisposeBatchDialog from "./ProductBatch/DisposeBatchDialog";

export const ProductBatchPage = () => {
  // ── Data fetching ─────────────────────────────────────────────────────────
  const { data: branches } = useGetBranchesQuery();
  const { data: products } = useGetProductsQuery();
  const { data: variants } = useGetVariantProductsQuery();
  const { data: suppliers } = useGetSuppliersQuery();

  // ── Local filter state ────────────────────────────────────────────────────
  const [selectedBranchId, setSelectedBranchId] = useState<string>(() => {
    return getCookie("pos_branch_id") || "all";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ── Dialog state — track which batch is selected for each action ──────────
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [showDetail, setShowDetail]   = useState(false);
  const [showEdit, setShowEdit]       = useState(false);
  const [showDispose, setShowDispose] = useState(false);

  // ── Lookup maps for enriching batch data with relational info ─────────────
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

  // ── Batch data ────────────────────────────────────────────────────────────
  const { data: apiBatches, isLoading: isLoadingBatches, refetch } = useGetProductBatchesQuery(
    selectedBranchId !== "all" ? { branch_id: selectedBranchId } : undefined
  );

  /** Enrich each batch with full relational objects from lookup maps */
  const enrichedBatches = useMemo(() => {
    if (!apiBatches) return [];
    return apiBatches.map((batch: any) => ({
      ...batch,
      productVariant: variantMap.get(batch.productVariantId) || batch.productVariant,
      branch:         branchMap.get(batch.branchId)          || batch.branch,
      supplier:       supplierMap.get(batch.supplierId)       || batch.supplier,
    }));
  }, [apiBatches, variantMap, branchMap, supplierMap]);

  /** Apply search query and status filter */
  const filteredBatches = useMemo(() => {
    return enrichedBatches.filter((batch: any) => {
      const productName = batch.productVariant?.product?.name_product || "";
      const variantName = batch.productVariant?.name_variant || "";

      const matchesSearch =
        batch.batchNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        variantName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || batch.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enrichedBatches, searchQuery, statusFilter]);

  /** Compute summary card statistics from all batches */
  const stats = useMemo(() => {
    if (!apiBatches) return { total: 0, active: 0, expired: 0, expiringSoon: 0 };
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    return apiBatches.reduce(
      (acc: any, batch: any) => {
        acc.total++;
        if (batch.status === "active") acc.active++;
        if (batch.status === "expired") acc.expired++;
        if (batch.expiryDate) {
          const expiry = new Date(batch.expiryDate);
          if (expiry > now && expiry <= thirtyDaysFromNow) acc.expiringSoon++;
        }
        return acc;
      },
      { total: 0, active: 0, expired: 0, expiringSoon: 0 }
    );
  }, [apiBatches]);

  // ── Action handlers ───────────────────────────────────────────────────────

  const handleOpenDetail = useCallback((batch: any, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent row click from firing when button is clicked
    setSelectedBatch(batch);
    setShowDetail(true);
  }, []);

  const handleOpenEdit = useCallback((batch: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedBatch(batch);
    setShowEdit(true);
  }, []);

  const handleOpenDispose = useCallback((batch: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedBatch(batch);
    setShowDispose(true);
  }, []);

  // ── Status badge renderer ─────────────────────────────────────────────────
  const getStatusBadge = (status: string, expiryDate?: string) => {
    const now    = new Date();
    const expiry = expiryDate ? new Date(expiryDate) : null;

    if (status === "expired" || (expiry && expiry < now)) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="size-3" /> Expired
        </Badge>
      );
    }
    if (expiry) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);
      if (expiry <= thirtyDaysFromNow) {
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
            <AlertCircle className="size-3" /> Expiring Soon
          </Badge>
        );
      }
    }
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
            <CheckCircle2 className="size-3" /> Active
          </Badge>
        );
      case "hold":
        return (
          <Badge variant="secondary" className="gap-1">
            <Timer className="size-3" /> On Hold
          </Badge>
        );
      case "sold_out":
        return <Badge variant="outline" className="gap-1">Sold Out</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isLoading = isLoadingBatches;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Batches</h1>
          <p className="text-muted-foreground">
            Track and manage product batches, expiry dates, and specific batch costs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <History className="size-4" />
            History
          </Button>
          <CreateBatchDialog onBatchAdded={refetch} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Batches",  value: stats.total,        icon: Package,     color: "text-primary",    bar: "bg-primary/20" },
          { label: "Active Stock",   value: stats.active,       icon: CheckCircle2, color: "text-emerald-500", bar: "bg-emerald-500/20" },
          { label: "Expiring Soon",  value: stats.expiringSoon, icon: Clock,       color: "text-amber-500",  bar: "bg-amber-500/20" },
          { label: "Expired",        value: stats.expired,      icon: XCircle,     color: "text-destructive", bar: "bg-destructive/20" },
        ].map(({ label, value, icon: Icon, color, bar }) => (
          <Card key={label} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className={`size-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {label === "Total Batches"  && "Across all filtered categories"}
                {label === "Active Stock"   && "Available for sale"}
                {label === "Expiring Soon"  && "Within next 30 days"}
                {label === "Expired"        && "Requires immediate action"}
              </p>
            </CardContent>
            <div className={`absolute bottom-0 left-0 h-1 w-full ${bar}`} />
          </Card>
        ))}
      </div>

      {/* Table Card */}
      <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Filters Row */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            {/* Search */}
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search batch number or product..."
                className="pl-9 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Branch + Status filters */}
            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches?.map((branch: any) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
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

          {/* Table */}
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
                  {/* Actions column — provides quick access without opening detail view */}
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredBatches.length > 0 ? (
                  filteredBatches.map((batch: any) => (
                    <TableRow key={batch.id} className="hover:bg-slate-50 transition-colors">
                      {/* Batch Info */}
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-slate-900">
                            {batch.batchNumber || "BN-" + batch.id.substring(0, 6)}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="size-3" />
                            Rec:{" "}
                            {batch.receivedDate
                              ? format(new Date(batch.receivedDate), "dd MMM yyyy")
                              : "—"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Product */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {batch.productVariant?.product?.name_product}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {batch.productVariant?.name_variant}
                          </span>
                        </div>
                      </TableCell>

                      {/* Quantity with mini progress bar */}
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-slate-700">
                            {batch.currentQuantity}{" "}
                            <span className="text-xs font-normal text-slate-500">
                              of {batch.initialQuantity}
                            </span>
                          </span>
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{
                                width: `${Math.min(100, (batch.currentQuantity / batch.initialQuantity) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      {/* Cost Price */}
                      <TableCell className="text-right font-mono font-medium">
                        $
                        {Number(batch.costPrice).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>

                      {/* Expiry Date */}
                      <TableCell>
                        <div
                          className={`flex items-center gap-2 ${
                            batch.expiryDate && new Date(batch.expiryDate) < new Date()
                              ? "text-destructive font-semibold"
                              : "text-slate-600"
                          }`}
                        >
                          <Timer className="size-4" />
                          {batch.expiryDate
                            ? format(new Date(batch.expiryDate), "dd MMM yyyy")
                            : "N/A"}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {getStatusBadge(batch.status, batch.expiryDate)}
                      </TableCell>

                      {/* Quick Actions */}
                      <TableCell className="text-center">
                        <TooltipProvider delayDuration={100}>
                          <div className="flex items-center justify-center gap-1">
                            {/* View Detail */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                  onClick={(e) => handleOpenDetail(batch, e)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View Detail</TooltipContent>
                            </Tooltip>

                            {/* Edit Batch */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50"
                                  onClick={(e) => handleOpenEdit(batch, e)}
                                  disabled={batch.status === "sold_out"}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {batch.status === "sold_out" ? "Cannot edit sold-out batch" : "Edit Batch"}
                              </TooltipContent>
                            </Tooltip>

                            {/* Dispose / Write-off */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  onClick={(e) => handleOpenDispose(batch, e)}
                                  disabled={
                                    batch.status === "sold_out" || batch.status === "expired"
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {batch.status === "sold_out" || batch.status === "expired"
                                  ? "Already disposed or sold out"
                                  : "Dispose / Write-off"}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No product batches found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <ProductBatchDetail
        batch={selectedBatch}
        open={showDetail}
        onOpenChange={setShowDetail}
      />
      <EditBatchDialog
        batch={selectedBatch}
        open={showEdit}
        onOpenChange={setShowEdit}
        onSuccess={refetch}
      />
      <DisposeBatchDialog
        batch={selectedBatch}
        open={showDispose}
        onOpenChange={setShowDispose}
        onSuccess={refetch}
      />
    </div>
  );
};
