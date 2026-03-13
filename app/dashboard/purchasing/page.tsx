"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useGetBranchesQuery } from "@/store/services/branch.service";
import { useGetProductsQuery } from "@/store/services/product.service";
import {
  useCreatePurchaseMutation,
  useGetPurchasesQuery
} from "@/store/services/purchasing.service";
import { useGetSuppliersQuery } from "@/store/services/supplier.service";
import { format } from "date-fns";
import { FileText, Plus, Search, ShoppingCart, Truck, X } from "lucide-react";
import { useMemo, useState } from "react";
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(amount);
};

// ── Create Purchase Dialog ───────────────────────────────────────────────────
function CreatePurchaseDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { data: suppliers } = useGetSuppliersQuery();
  const { data: branches } = useGetBranchesQuery();
  const { data: products } = useGetProductsQuery();
  const [createPurchase, { isLoading }] = useCreatePurchaseMutation();

  const [supplierId, setSupplierId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [items, setItems] = useState<{ product_id: string; quantity: number }[]>([]);

  const handleCreate = async () => {
    if (!supplierId || !branchId || items.length === 0) return;
    try {
      // Auto-fetch price from product for MVP (or allow manual input)
      const mappedItems = items.map((item) => {
        const prod = products?.find((p: any) => p.id === item.product_id);
        return {
          product_id: item.product_id,
          quantity: item.quantity,
          price: prod?.basePrice || 0
        };
      });
      const totalCost = mappedItems.reduce((acc, curr) => acc + curr.quantity * curr.price, 0);

      await createPurchase({
        supplier_id: supplierId,
        branch: { id: branchId } as any, // Type matching Partial<Purchase>
        payment_method: "cash",
        paid_amount: totalCost,
        purchaseItems: mappedItems as any
      }).unwrap();

      setOpen(false);
      setSupplierId("");
      setBranchId("");
      setItems([]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="text-primary h-5 w-5" />
            Create Purchase Order
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Supplier *</label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier..." />
                </SelectTrigger>
                <SelectContent>
                  {suppliers?.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Branch *</label>
              <Select value={branchId} onValueChange={setBranchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination branch..." />
                </SelectTrigger>
                <SelectContent>
                  {branches?.map((b: any) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name_branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Order Items *(Need at least 1)</label>
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Select
                  value={item.product_id}
                  onValueChange={(val) => {
                    const newItems = [...items];
                    newItems[index].product_id = val;
                    setItems(newItems);
                  }}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min="1"
                  className="w-24"
                  value={item.quantity || ""}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index].quantity = parseInt(e.target.value) || 0;
                    setItems(newItems);
                  }}
                  placeholder="Qty"
                />

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive h-9 w-9"
                  onClick={() => setItems(items.filter((_, i) => i !== index))}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={() => setItems([...items, { product_id: "", quantity: 1 }])}>
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isLoading || !supplierId || !branchId || items.length === 0}>
            {isLoading ? "Saving..." : "Create PO"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PurchasingPage() {
  const { data: purchases, isLoading } = useGetPurchasesQuery();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!purchases) return [];
    return purchases.filter((p) => {
      const matchSearch =
        p.supplier_id?.toLowerCase().includes(search.toLowerCase()) ||
        p.branch?.name_branch?.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [purchases, search]);

  const stats = useMemo(() => {
    if (!purchases) return { total: 0, amount: 0, items: 0 };
    return {
      total: purchases.length,
      amount: purchases.reduce((sum, p) => sum + Number(p.total || 0), 0),
      items: purchases.reduce((sum, p) => sum + (p.purchaseItems?.length || 0), 0)
    };
  }, [purchases]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <ShoppingCart className="text-primary h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Purchase Orders</h1>
            <p className="text-muted-foreground text-sm">Manage inventory orders from suppliers</p>
          </div>
        </div>
        <CreatePurchaseDialog
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Order
            </Button>
          }
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Orders",
            value: stats.total,
            color: "text-blue-600",
            bg: "bg-blue-500/10",
            icon: FileText
          },
          {
            label: "Total Value",
            value: formatCurrency(stats.amount),
            color: "text-green-600",
            bg: "bg-green-500/10",
            icon: ShoppingCart
          },
          {
            label: "Items Ordered",
            value: stats.items,
            color: "text-amber-600",
            bg: "bg-amber-500/10",
            icon: Truck
          }
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border p-4">
            <div className={`mb-3 inline-flex rounded-lg p-2 ${s.bg}`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-muted-foreground text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border">
        <div className="flex items-center gap-3 border-b p-4">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              className="pl-9"
              placeholder="Search by supplier or branch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Badge variant="secondary">{filtered.length} orders</Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Info</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground py-12 text-center">
                  <ShoppingCart className="mx-auto mb-3 h-8 w-8 opacity-30" />
                  {search
                    ? "No orders match your search."
                    : "No orders yet. Create your first purchase order!"}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order) => (
                <TableRow key={order.id} className="group hover:bg-muted/50 cursor-pointer">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-muted text-muted-foreground flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          PO-{order.id.substring(0, 6).toUpperCase()}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {format(new Date(order.createdAt), "dd MMM yyyy")}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.status === "COMPLETED" ? (
                      <Badge className="border-green-200 bg-green-500/10 text-green-700 hover:bg-green-500/20">
                        Completed
                      </Badge>
                    ) : order.status === "CANCELED" ? (
                      <Badge variant="destructive">Canceled</Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="border-yellow-200 bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{order.branch?.name_branch || "—"}</TableCell>
                  <TableCell className="text-sm">
                    <Badge variant="outline">{order.purchaseItems?.length || 0} items</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(order.total)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
