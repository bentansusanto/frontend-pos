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
import { ArrowRight, FileDown, PackageCheck, Plus, Search, Truck, Eye, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useMemo, useState } from "react";

function ViewReceivingDialog({ open, onOpenChange, receiving }: { open: boolean, onOpenChange: (open: boolean) => void, receiving: any }) {
  if (!receiving) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="text-primary h-5 w-5" />
            Receiving Details
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-sm">
          <div className="grid grid-cols-2 gap-2 border-b pb-4">
            <div>
              <p className="text-muted-foreground">Receiving ID</p>
              <p className="font-medium">RCV-{receiving.id.substring(0, 6).toUpperCase()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Original PO</p>
              <Badge variant="outline">PO-{receiving.purchase?.id?.substring(0,6).toUpperCase()}</Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Supplier</p>
              <p className="font-medium">{receiving.supplier?.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Branch</p>
              <p className="font-medium">{receiving.branch?.name}</p>
            </div>
            <div className="col-span-2 mt-2">
              <p className="text-muted-foreground">Note</p>
              <p className="font-medium">{receiving.note || "—"}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Received Variants</h4>
            <div className="border rounded-md">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Product / Variant</TableHead>
                    <TableHead className="text-right">Received Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receiving.items?.map((item: any) => (
                     <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div>
                          {item.productVariant?.product?.name_product || 
                           (item.productVariant as any)?.product?.name || 
                           "Product Name Not Found"}
                        </div>
                        <div className="text-muted-foreground text-[10px] font-normal">
                          {item.productVariant?.name_variant}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.qty}</TableCell>
                    </TableRow>
                  ))}
                  {(!receiving.items || receiving.items.length === 0) && (
                    <TableRow><TableCell colSpan={2} className="text-center py-4">No items recorded.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReceivingActionMenu({ receiving }: { receiving: any }) {
  const [viewOpen, setViewOpen] = useState(false);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setViewOpen(true)}>
            <Eye className="mr-2 h-4 w-4" /> View Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ViewReceivingDialog open={viewOpen} onOpenChange={setViewOpen} receiving={receiving} />
    </div>
  );
}

export default function PurchaseReceivingPage() {
  const { data: receivings, isLoading } = useGetPurchaseReceivingsQuery();

  // ── Create Receiving Dialog ───────────────────────────────────────────────────
  function CreatePurchaseReceivingDialog({ trigger }: { trigger: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const { data: purchases } = useGetPurchasesQuery();
    const { data: variants } = useGetVariantProductsQuery();
    const [createReceiving, { isLoading }] = useCreatePurchaseReceivingMutation();

    const pendingPOs = useMemo(
      () => purchases?.filter((p) => p.status === "PENDING" || p.status === "PARTIAL") || [],
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
          purchase_id: selectedPO,
          supplier_id: po?.supplier_id || "",
          branch_id: po?.branch?.id || "",
          note: `Received against PO-${selectedPO.substring(0, 6).toUpperCase()}`,
          items: items.map((i) => ({
            product_variant_id: i.product_variant_id,
            qty: i.receive_qty,
            cost: 0
          }))
        } as any).unwrap();

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
                      {po.branch?.name || "Unknown Branch"}
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
                          {variants
                            ?.filter(
                              (v: any) =>
                                v.productId === item.original_product_id ||
                                v.product?.id === item.original_product_id
                            )
                            ?.map((v: any) => (
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
        r.branch?.name?.toLowerCase().includes(search.toLowerCase()) ||
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
              <TableHead className="text-right pr-4">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-12 text-center">
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
                    <TableCell className="text-sm">{record.branch?.name || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{totalQty} qty</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <ReceivingActionMenu receiving={record} />
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
