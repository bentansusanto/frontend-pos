"use client";

import { useGetProductsQuery } from "@/store/services/product.service";
import { 
  useGetStockTakeQuery, 
  useSubmitStockTakeMutation,
  useApproveStockTakeMutation,
  useRejectStockTakeMutation
} from "@/store/services/stock-take.service";
import { ArrowLeft, Save, Search, CheckCircle2, Package, Hash, ArrowUpRight, ArrowDownRight, AlertTriangle, ScanLine, Zap, Camera, X, Check, Ban, Clock, UserCheck, Info } from "lucide-react";
import { CameraScanner } from "@/components/modules/Inventory/Barcode/CameraScanner";
import { BranchName } from "@/components/modules/Inventory/Shared/BranchName";
import { UserName } from "@/components/modules/Inventory/Shared/UserName";
import { useParams, useRouter } from "next/navigation";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REASON_CODES = [
  { value: "DAMAGED", label: "Damaged" },
  { value: "EXPIRED", label: "Expired" },
  { value: "THEFT", label: "Lost/Stolen" },
  { value: "ADMIN_ERROR", label: "Admin Error" },
  { value: "OTHER", label: "Other" },
];

export default function StockTakeSessionPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const { data: session, isLoading: isLoadingRealSession } = useGetStockTakeQuery(id as string, { skip: !id });

  const { data: productsData, isLoading: isLoadingProducts } = useGetProductsQuery(
    session?.branchId ? { branch_id: session.branchId } : undefined,
    { skip: !session?.branchId }
  );
  
  const [submitStockTake, { isLoading: isSubmitting }] = useSubmitStockTakeMutation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [isScanMode, setIsScanMode] = useState(false);
  const barcodeRef = useRef<HTMLInputElement>(null);
  const [countedQuantities, setCountedQuantities] = useState<Record<string, number>>({});
  const [countedReasons, setCountedReasons] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");

  const [approveStockTake, { isLoading: isApproving }] = useApproveStockTakeMutation();
  const [rejectStockTake, { isLoading: isRejecting }] = useRejectStockTakeMutation();

  useEffect(() => {
    if (session?.items) {
      const initialQty: Record<string, number> = {};
      const initialReasons: Record<string, string> = {};
      session.items.forEach((item: any) => {
        initialQty[item.variantId] = item.countedQty;
        if (item.reason) initialReasons[item.variantId] = item.reason;
      });
      setCountedQuantities(initialQty);
      setCountedReasons(initialReasons);
      setNotes(session.notes || "");
    }
  }, [session]);

  const isCompleted = session?.status === "completed";
  const isPendingApproval = session?.status === "pending_approval";
  const isRejected = session?.status === "rejected";
  const isReadOnly = isCompleted || isPendingApproval || isRejected;

  const allVariants = useMemo(() => {
    // If completed session (real or dummy), use the items from the session
    if (isReadOnly && session?.items) {
      return session.items.map((item: any) => ({
        id: item.variantId,
        productName: item.productName || "Unknown Product",
        variantName: item.variantName,
        sku: item.sku,
        stock: item.systemQty,
        reason: item.reason
      }));
    }

    // If draft, use products from productsData
    if (!productsData) return [];
    
    const variants: any[] = [];
    productsData.forEach((product: any) => {
      if (product.variants) {
        product.variants.forEach((v: any) => {
          variants.push({
            ...v,
            productName: product.name_product || "Unknown Product"
          });
        });
      }
    });
    return variants;
  }, [productsData, isCompleted, session]);

  const filteredVariants = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return allVariants.filter((v: any) => {
      const pName = (v.productName || "").toLowerCase();
      const vName = (v.name_variant || "").toLowerCase();
      const sku = (v.sku || "").toLowerCase();
      const barcode = (v.barcode || "").toLowerCase();
      return pName.includes(query) || vName.includes(query) || sku.includes(query) || barcode.includes(query);
    });
  }, [allVariants, searchQuery]);

  const reconStats = useMemo(() => {
    const variants = allVariants;
    const itemsCounted = Object.keys(countedQuantities).length;
    let totalDifference = 0;
    let surplusCount = 0;
    let shortageCount = 0;

    variants.forEach((v: any) => {
      if (countedQuantities[v.id] !== undefined) {
        const diff = (countedQuantities[v.id] || 0) - (v.stock || 0);
        totalDifference += diff;
        if (diff > 0) surplusCount += 1;
        if (diff < 0) shortageCount += 1;
      }
    });

    return {
      total: variants.length,
      counted: itemsCounted,
      progress: variants.length > 0 ? (itemsCounted / variants.length) * 100 : 0,
      totalDiff: totalDifference,
      surplus: surplusCount,
      shortage: shortageCount
    };
  }, [allVariants, countedQuantities]);

  const handleQtyChange = (variantId: string, val: string) => {
    const num = parseInt(val);
    if (isNaN(num)) {
      setCountedQuantities(prev => {
        const next = { ...prev };
        delete next[variantId];
        return next;
      });
    } else {
      setCountedQuantities(prev => ({ ...prev, [variantId]: num }));
    }
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processBarcode(barcodeInput);
  };

  const processBarcode = (sku: string) => {
    if (!sku) return;

    const variant = allVariants.find((v: any) => 
      v.sku?.toLowerCase() === sku.toLowerCase() || 
      v.barcode?.toLowerCase() === sku.toLowerCase()
    );
    if (variant) {
      const currentQty = countedQuantities[variant.id] ?? (isCompleted ? 0 : variant.stock ?? 0);
      setCountedQuantities(prev => ({ ...prev, [variant.id]: currentQty + 1 }));
      toast.success(`Counted: ${variant.productName} (${variant.name_variant})`);
      setBarcodeInput("");
      // Keep focus for next scan if keyboard ref exists
      barcodeRef.current?.focus();
    } else {
      toast.error(`SKU ${sku} not found in this branch`);
      setBarcodeInput("");
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(countedQuantities).length === 0) {
      toast.error("Please enter at least one counted quantity");
      return;
    }

    try {
      const items = Object.entries(countedQuantities).map(([variantId, countedQty]) => ({
        variant_id: variantId,
        countedQty,
        reason: countedReasons[variantId]
      }));

      await submitStockTake({
        id: id as string,
        items,
        notes
      }).unwrap();

      toast.success("Audit submitted for manager approval");
    } catch (error) {
      toast.error("Failed to submit stock take");
    }
  };

  const handleApprove = async () => {
    try {
      await approveStockTake(id as string).unwrap();
      toast.success("Audit approved and stock updated!");
    } catch (err) {
      toast.error("Failed to approve audit");
    }
  };

  const handleReject = async () => {
    try {
      await rejectStockTake(id as string).unwrap();
      toast.success("Audit rejected");
    } catch (err) {
      toast.error("Failed to reject audit");
    }
  };

  if (!isLoadingRealSession && !session) return <div className="p-12 text-center text-red-500">Session Not Found</div>;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              Audit Session
              <Badge 
                variant={isCompleted ? "default" : isPendingApproval ? "secondary" : isRejected ? "destructive" : "outline"} 
                className={
                  isCompleted ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none" : 
                  isPendingApproval ? "bg-amber-100 text-amber-700 hover:bg-amber-100 border-none" : 
                  isRejected ? "bg-rose-100 text-rose-700 hover:bg-rose-100 border-none px-3" : ""
                }
              >
                {isCompleted ? <Check className="size-3 mr-1" /> : isPendingApproval ? <Clock className="size-3 mr-1" /> : isRejected ? <Ban className="size-3 mr-1" /> : null}
                {session?.status?.toUpperCase()}
              </Badge>
              {session?.isFrozen && !isReadOnly && (
                <Badge variant="destructive" className="bg-rose-100 text-rose-700 border-none hover:bg-rose-100 flex gap-1 items-center">
                  <Zap className="size-3 fill-rose-700" /> FROZEN
                </Badge>
              )}
            </h3>
            <div className="text-muted-foreground text-sm flex items-center gap-2">
              <BranchName id={session?.branchId} /> • Session #{id}
              {session?.userId && (
                <span className="text-slate-300">
                  | Auditor: <UserName id={session.userId} />
                </span>
              )}
            </div>
          </div>
        </div>
        {!isReadOnly && session?.status === 'draft' && (
          <Button onClick={handleSubmit} disabled={isSubmitting || reconStats.counted === 0} className="gap-2 bg-indigo-600 hover:bg-indigo-700 font-bold">
            <Save className="size-4" />
            Submit for Approval
          </Button>
        )}
        {isPendingApproval && (
           <div className="flex gap-2">
              <Button onClick={handleReject} variant="outline" disabled={isRejecting} className="gap-2 border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-bold">
                 <Ban className="size-4" /> Reject
              </Button>
              <Button onClick={handleApprove} disabled={isApproving} className="gap-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold px-6 shadow-lg shadow-emerald-200">
                 <Check className="size-4" /> Approve & Update Stock
              </Button>
           </div>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl border bg-white shadow-sm ring-1 ring-slate-200/50">
          <CardContent>
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-slate-500">Total Items</p>
              <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
                <Package className="size-6" />
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{reconStats.total}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border bg-white shadow-sm ring-1 ring-slate-200/50">
          <CardContent>
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-slate-500">Items Counted</p>
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Hash className="size-6" />
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold tracking-tight text-indigo-600">{reconStats.counted}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border bg-white shadow-sm ring-1 ring-slate-200/50">
          <CardContent>
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-slate-500">Surplus</p>
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <ArrowUpRight className="size-6" />
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-600">+{reconStats.surplus}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border bg-white shadow-sm ring-1 ring-slate-200/50">
          <CardContent>
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-slate-500">Shortage</p>
              <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
                <ArrowDownRight className="size-6" />
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold tracking-tight text-rose-600">-{reconStats.shortage}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card className="rounded-xl border bg-white shadow-sm ring-1 ring-slate-200/50">
          <CardHeader className="pb-4 border-b">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    placeholder="Search products..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isCompleted}
                  />
                </div>
                {!isCompleted && (
                  <Button 
                    variant={isScanMode ? "default" : "outline"} 
                    onClick={() => {
                        setIsScanMode(!isScanMode);
                        if (!isScanMode) setTimeout(() => barcodeRef.current?.focus(), 100);
                    }}
                    className="gap-2 shrink-0"
                  >
                    <ScanLine className="size-4" />
                    {isScanMode ? "Scan Active" : "Scan Mode"}
                  </Button>
                )}
              </div>
              
              {isScanMode && !isCompleted && (
                <div className="flex-1 max-w-sm flex gap-2">
                   <form onSubmit={handleBarcodeSubmit} className="relative flex-1">
                      <Zap className="text-amber-500 absolute top-1/2 left-3 size-4 -translate-y-1/2 animate-pulse" />
                      <Input
                        ref={barcodeRef}
                        placeholder="Scan Barcode / SKU here..."
                        className="pl-9 border-amber-200 focus-visible:ring-amber-500 bg-amber-50/30"
                        value={barcodeInput}
                        onChange={(e) => setBarcodeInput(e.target.value)}
                        autoFocus
                      />
                   </form>
                   <Button 
                      type="button"
                      onClick={() => setShowCameraScanner(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 h-10 rounded-xl font-black uppercase tracking-widest text-[10px]"
                   >
                      <Camera className="mr-2 size-4" /> Camera
                   </Button>
                </div>
              )}

              <div className="flex-1 max-w-xs text-right">
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-slate-500">Audit Progress</span>
                  <span className="text-slate-900">{Math.round(reconStats.progress)}%</span>
                </div>
                <Progress value={reconStats.progress} className="h-2" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="pl-6">Product Information</TableHead>
                  <TableHead className="text-center">System Qty</TableHead>
                  <TableHead className="text-center">Counted Qty</TableHead>
                  <TableHead className="text-center">Difference</TableHead>
                  <TableHead className="text-center">Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingProducts ? (
                  <TableRow><TableCell colSpan={5} className="h-48 text-center text-muted-foreground">Loading products...</TableCell></TableRow>
                ) : filteredVariants.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-48 text-center text-muted-foreground">No products found.</TableCell></TableRow>
                ) : (
                  filteredVariants.map((variant: any) => {
                    const systemQty = variant.stock || 0;
                    const countedQtyRaw = countedQuantities[variant.id];
                    const isCounted = countedQtyRaw !== undefined;
                    const countedQty = countedQtyRaw ?? (isCompleted ? 0 : systemQty);
                    const difference = countedQty - systemQty;

                    return (
                      <TableRow key={variant.id} className="hover:bg-slate-50/50">
                        <TableCell className="pl-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{variant.productName}</span>
                            <span className="text-xs text-slate-500">{variant.variantName} • {variant.sku}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-mono">{systemQty}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {isReadOnly ? (
                            <span className="font-bold">{countedQty}</span>
                          ) : (
                            <Input
                              type="number"
                              className="w-24 mx-auto text-center h-8"
                              value={countedQtyRaw ?? ""}
                              placeholder={systemQty.toString()}
                              onChange={(e) => handleQtyChange(variant.id, e.target.value)}
                            />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {!isCounted && !isReadOnly ? (
                            <span className="text-xs text-slate-400 italic">Pending</span>
                          ) : difference === 0 ? (
                            <CheckCircle2 className="mx-auto size-5 text-emerald-500" />
                          ) : (
                            <Badge className={difference > 0 ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none" : "bg-rose-100 text-rose-700 hover:bg-rose-100 border-none font-bold"}>
                              {difference > 0 ? `+${difference}` : difference}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {difference !== 0 ? (
                            isReadOnly ? (
                              <span className="text-xs font-bold text-slate-500">{REASON_CODES.find(r => r.value === variant.reason)?.label || variant.reason || "-"}</span>
                            ) : (
                              <Select 
                                value={countedReasons[variant.id] || ""} 
                                onValueChange={(val) => setCountedReasons(prev => ({ ...prev, [variant.id]: val }))}
                              >
                                <SelectTrigger className="w-32 h-8 text-[10px] uppercase font-bold">
                                  <SelectValue placeholder="Reason?" />
                                </SelectTrigger>
                                <SelectContent>
                                  {REASON_CODES.map(code => (
                                    <SelectItem key={code.value} value={code.value} className="text-[10px] uppercase font-bold">
                                      {code.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )
                          ) : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-xl border bg-white shadow-sm ring-1 ring-slate-200/50">
          <CardHeader>
            <CardTitle className="text-lg">Session Notes</CardTitle>
            <CardDescription>Add details about this audit session for future reference.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="e.g., Audit done by Team A, discovered breakage in aisle 3..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isReadOnly}
              className="h-12"
            />
            {isPendingApproval && (
               <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-100">
                <Clock className="size-5 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-800">
                  This audit is <strong>Pending Approval</strong>. A manager must review the discrepancies and approve them before stock levels are updated.
                </p>
              </div>
            )}
            {isCompleted && session?.approvedById && (
               <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <UserCheck className="size-5 text-emerald-500 shrink-0" />
                <div className="text-xs text-emerald-800">
                  Approved by <strong><UserName id={session.approvedById} /></strong> on {new Date(session.approvedAt).toLocaleString()}
                </div>
              </div>
            )}
            {!isReadOnly && session?.status === 'draft' && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <Info className="size-5 text-indigo-500 shrink-0" />
                <p className="text-xs text-indigo-800">
                  Submitting this audit will send it to a manager for approval. Stock levels will only change AFTER approval.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Camera Scanner Overlay */}
      {showCameraScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-3xl p-2 w-full max-w-md shadow-2xl">
              <CameraScanner 
                onScan={(sku) => {
                  processBarcode(sku);
                }} 
                onClose={() => setShowCameraScanner(false)} 
              />
           </div>
        </div>
      )}
    </div>
  );
}
