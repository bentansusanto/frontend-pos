"use client";

import { useGetProfileQuery } from "@/store/services/auth.service";
import { useCreateStockTakeMutation, useGetStockTakesQuery } from "@/store/services/stock-take.service";
import { getCookie } from "@/utils/cookies";
import { Plus, ClipboardList, Package, CheckCircle2, Clock, ChevronRight, Ban } from "lucide-react";
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { BranchName } from "@/components/modules/Inventory/Shared/BranchName";
import { UserName } from "@/components/modules/Inventory/Shared/UserName";

export default function StockTakePage() {
  const router = useRouter();
  const { data: profile } = useGetProfileQuery();
  const selectedBranchId = getCookie("pos_branch_id");

  const { data: realStockTakes, isLoading: isLoadingReal } = useGetStockTakesQuery(selectedBranchId || "");
  const [createStockTake, { isLoading: isCreating }] = useCreateStockTakeMutation();

  const stockTakes = realStockTakes || [];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalItems = stockTakes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = stockTakes.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const stats = useMemo(() => {
    const completed = stockTakes.filter((s: any) => s.status === "completed").length;
    const pending = stockTakes.filter((s: any) => s.status === "pending_approval").length;
    const total = stockTakes.length;
    return {
      total,
      completed,
      pending,
      draft: total - completed - pending
    };
  }, [stockTakes]);

  const [isFrozen, setIsFrozen] = useState(false);
  const [open, setOpen] = useState(false);

  const handleCreate = async () => {
    if (!selectedBranchId) {
      toast.error("Please select a branch first");
      return;
    }

    try {
      const result = await createStockTake({
        branch_id: selectedBranchId,
        notes: `Stock Take session started by ${profile?.name}`,
        isFrozen: isFrozen
      }).unwrap();

      toast.success("Stock take session created");
      setOpen(false);
      router.push(`/dashboard/inventory/stock-take/${result.data.id}`);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create stock take session");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold">Stock Take (Opname Stok)</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Audit and reconcile your physical stock with system inventory.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              New Stock Take
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start Audit Session</DialogTitle>
              <DialogDescription>
                Create a new session to reconcile your physical inventory.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between rounded-xl border p-4 bg-slate-50/50">
                <div className="space-y-0.5">
                  <Label className="text-base">Freeze Transactions</Label>
                  <p className="text-sm text-muted-foreground">
                    Block all sales in this branch until audit is finished.
                  </p>
                </div>
                <Switch 
                  checked={isFrozen} 
                  onCheckedChange={setIsFrozen} 
                />
              </div>

              {isFrozen && (
                <div className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-800">
                  <AlertTriangle className="size-5 shrink-0" />
                  <p className="text-xs">
                    <strong>Warning:</strong> Locking inventory will prevent cashiers from processing any orders at this branch. Use this for 100% data accuracy.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={isCreating}>Start Audit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards Standard Style */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-xl border bg-white shadow-sm ring-1 ring-slate-200/50">
          <CardContent>
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-slate-500">Total Sessions</p>
              <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
                <Package className="size-6" />
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border bg-white shadow-sm ring-1 ring-slate-200/50">
          <CardContent>
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-slate-500">Completed</p>
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <CheckCircle2 className="size-6" />
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-600">{stats.completed}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border bg-white shadow-sm ring-1 ring-slate-200/50">
          <CardContent>
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-slate-500">Wait Approval</p>
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <Clock className="size-6" />
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold tracking-tight text-amber-600">{stats.pending}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border bg-white shadow-sm ring-1 ring-slate-200/50">
          <CardContent>
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-slate-500">Draft Sessions</p>
              <div className="rounded-xl bg-slate-50 p-3 text-slate-400">
                <Plus className="size-6" />
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-400">{stats.draft}</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border bg-white p-0 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Stock Taker</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingReal && stockTakes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">Loading sessions...</TableCell>
              </TableRow>
            ) : currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <ClipboardList className="size-8 text-slate-300" />
                    <p className="text-muted-foreground text-sm">No stock take sessions found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((session: any) => (
                <TableRow
                  key={session.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => router.push(`/dashboard/inventory/stock-take/${session.id}`)}
                >
                  <TableCell className="font-medium text-slate-500">#{session.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{new Date(session.createdAt).toLocaleDateString()}</span>
                      <span className="text-xs text-slate-500">{new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </TableCell>
                  <TableCell><BranchName id={session.branchId} /></TableCell>
                  <TableCell><UserName id={session.userId} /></TableCell>
                   <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={session.status === "completed" ? "default" : session.status === "pending_approval" ? "secondary" : session.status === "rejected" ? "destructive" : "outline"} 
                        className={
                          session.status === "completed" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none" : 
                          session.status === "pending_approval" ? "bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-3" : 
                          session.status === "rejected" ? "bg-rose-100 text-rose-700 hover:bg-rose-100 border-none px-3" : ""
                        }
                      >
                        {session.status === "completed" ? <CheckCircle2 className="size-3 mr-1" /> : session.status === "pending_approval" ? <Clock className="size-3 mr-1" /> : session.status === "rejected" ? <Ban className="size-3 mr-1" /> : null}
                        {session.status.toUpperCase()}
                      </Badge>
                      {session.isFrozen && session.status !== "completed" && session.status !== "rejected" && (
                        <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50 px-1 text-[10px]">FROZEN</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2 py-4 border-t bg-white rounded-b-xl">
        <p className="text-sm text-slate-500">
          Showing <span className="font-medium text-slate-900">{totalItems > 0 ? startIndex + 1 : 0}</span> to{" "}
          <span className="font-medium text-slate-900">{endIndex}</span> of{" "}
          <span className="font-medium text-slate-900">{totalItems}</span> sessions
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 px-3"
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className={`h-8 w-8 p-0 ${currentPage === page ? "bg-slate-900 text-white" : "text-slate-600"}`}
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 px-3"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
