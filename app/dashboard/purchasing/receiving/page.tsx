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
import { useGetVariantProductsQuery } from "@/store/services/product.service";
import {
  useCreatePurchaseReceivingMutation,
  useGetPurchaseReceivingsQuery,
  useGetPurchasesQuery
} from "@/store/services/purchasing.service";
import { format } from "date-fns";
import { ArrowRight, FileDown, PackageCheck, Plus, Search, Truck } from "lucide-react";
import { useMemo, useState } from "react";

export default function PurchaseReceivingPage() {
  const { data: receivings, isLoading } = useGetPurchaseReceivingsQuery();

  // ── Create Receiving Dialog ───────────────────────────────────────────────────
  function CreatePurchaseReceivingDialog({ trigger }: { trigger: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const { data: purchases } = useGetPurchasesQuery();
    const { data: variants } = useGetVariantProductsQuery();
    const [createReceiving, { isLoading }] = useCreatePurchaseReceivingMutation();

    const pendingPOs = useMemo(
      () => purchases?.filter((p) => p.status === "PENDING") || [],
      [purchases]
    );

    const [selectedPO, setSelectedPO] = useState<string>("");
    const [items, setItems] = useState<
      {
        original_product_id: string;
        product_variant_id: string;
        receive_qty: number;
        name: string;
      }[]
    >([]);

    // Auto-fill items when a PO is selected
    const handlePOSelect = (poId: string) => {
      setSelectedPO(poId);
      const po = pendingPOs.find((p: any) => p.id === poId);
      if (po && po.purchaseItems) {
        setItems(
          po.purchaseItems.map((pi: any) => ({
            original_product_id: pi.product_id,
            name: pi.product_id, // we don't have product name natively in this DTO, MVP placeholder
            product_variant_id: "",
            receive_qty: pi.quantity
          }))
        );
      } else {
        setItems([]);
      }
    };

    const handleCreate = async () => {
      if (!selectedPO || items.some((i) => !i.product_variant_id)) return;
      const po = pendingPOs.find((p: any) => p.id === selectedPO);

      try {
        await createReceiving({
          purchase: { id: selectedPO } as any, // RTK/Backend relations expect Object map
          supplier: { id: po?.supplier_id } as any,
          branch: { id: po?.branch?.id } as any,
          note: `Received against PO-${selectedPO.substring(0, 6).toUpperCase()}`,
          items: items.map((i) => ({
            productVariant: { id: i.product_variant_id } as any,
            qty: i.receive_qty,
            cost: 0
          })) as any
        }).unwrap();

        setOpen(false);
        setSelectedPO("");
        setItems([]);
      } catch (e) {
        console.error(e);
      }
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackageCheck className="text-primary h-5 w-5" />
              Receive Shipment
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pending Purchase Order *</label>
              <Select value={selectedPO} onValueChange={handlePOSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select active PO to receive..." />
                </SelectTrigger>
                <SelectContent>
                  {pendingPOs.map((po: any) => (
                    <SelectItem key={po.id} value={po.id}>
                      PO-{po.id.substring(0, 6).toUpperCase()} —{" "}
                      {po.branch?.name_branch || "Unknown Branch"}
                    </SelectItem>
                  ))}
                  {pendingPOs.length === 0 && (
                    <SelectItem value="none" disabled>
                      No Pending Orders Found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedPO && items.length > 0 && (
              <div className="bg-muted/20 mt-4 space-y-3 rounded-lg border p-4">
                <h4 className="mb-2 text-sm font-semibold">Map Order Items to Received Variants</h4>
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 items-center gap-2 text-sm">
                    <div className="text-muted-foreground col-span-3 truncate">
                      Product ID: {item.original_product_id.substring(0, 8)}...
                    </div>
                    <div className="col-span-1 text-center">
                      <ArrowRight className="text-muted-foreground mx-auto h-4 w-4" />
                    </div>
                    <div className="col-span-5">
                      <Select
                        value={item.product_variant_id}
                        onValueChange={(val) => {
                          const newItems = [...items];
                          newItems[index].product_variant_id = val;
                          setItems(newItems);
                        }}>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select variant..." />
                        </SelectTrigger>
                        <SelectContent>
                          {variants?.map((v: any) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.name_variant}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                      <span className="text-muted-foreground text-xs whitespace-nowrap">
                        Rcv Qty:
                      </span>
                      <Input
                        type="number"
                        className="h-8"
                        min="0"
                        value={item.receive_qty}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].receive_qty = parseInt(e.target.value) || 0;
                          setItems(newItems);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isLoading || !selectedPO || items.some((i) => !i.product_variant_id)}>
              {isLoading ? "Saving..." : "Confirm Receiving"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!receivings) return [];
    return receivings.filter((r) => {
      return (
        r.supplier?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.branch?.name_branch?.toLowerCase().includes(search.toLowerCase()) ||
        r.note?.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [receivings, search]);

  const stats = useMemo(() => {
    if (!receivings) return { total: 0, items: 0, distinctSuppliers: 0 };
    const suppliers = new Set(receivings.map((r) => r.supplier?.id));
    return {
      total: receivings.length,
      items: receivings.reduce(
        (sum, r) => sum + (r.items?.reduce((isum, i) => isum + i.qty, 0) || 0),
        0
      ),
      distinctSuppliers: suppliers.size
    };
  }, [receivings]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <PackageCheck className="text-primary h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Purchase Receiving</h1>
            <p className="text-muted-foreground text-sm">
              Monitor stock shipments and allocate inventory
            </p>
          </div>
        </div>
        <CreatePurchaseReceivingDialog
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Receive Shipment
            </Button>
          }
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Receivings",
            value: stats.total,
            color: "text-blue-600",
            bg: "bg-blue-500/10",
            icon: FileDown
          },
          {
            label: "Total Items Received",
            value: stats.items,
            color: "text-green-600",
            bg: "bg-green-500/10",
            icon: PackageCheck
          },
          {
            label: "Active Suppliers",
            value: stats.distinctSuppliers,
            color: "text-purple-600",
            bg: "bg-purple-500/10",
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
              placeholder="Search by supplier, branch, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Badge variant="secondary">{filtered.length} shipments</Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shipment Info</TableHead>
              <TableHead>Original Order</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead className="text-right">Total Items</TableHead>
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
                  <PackageCheck className="mx-auto mb-3 h-8 w-8 opacity-30" />
                  {search ? "No shipments match your search." : "No shipments tracked yet."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((record) => {
                const totalQty = record.items?.reduce((sum, item) => sum + item.qty, 0) || 0;

                return (
                  <TableRow key={record.id} className="group hover:bg-muted/50 cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-muted text-muted-foreground flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold">
                          <FileDown className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            RCV-{record.id.substring(0, 6).toUpperCase()}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {format(new Date(record.createdAt), "dd MMM yyyy")}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {record.purchase?.id ? (
                        <Badge
                          variant="secondary"
                          className="bg-blue-500/10 font-mono text-blue-700">
                          PO-{record.purchase.id.substring(0, 6).toUpperCase()}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{record.supplier?.name || "—"}</TableCell>
                    <TableCell className="text-sm">{record.branch?.name_branch || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{totalQty} qty</Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
