"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { type Supplier } from "@/store/services/supplier.service";
import {
  Building2,
  Mail,
  MoreHorizontal,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Truck
} from "lucide-react";
import { useState } from "react";
import { useCreateSupplier, useSupplierList, useUpdateSupplier } from "./hooks";

// ── Shared form fields ─────────────────────────────────────────────────────────
function SupplierFormFields({ formik }: { formik: any }) {
  const f = (key: string) => ({
    id: key,
    name: key,
    value: formik.values[key] ?? "",
    onChange: formik.handleChange,
    onBlur: formik.handleBlur
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2 space-y-1.5">
        <Label htmlFor="name">Company Name *</Label>
        <Input placeholder="PT Sumber Makmur" {...f("name")} />
        {formik.touched.name && formik.errors.name && (
          <p className="text-destructive text-xs">{formik.errors.name}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email *</Label>
        <Input type="email" placeholder="supplier@company.com" {...f("email")} />
        {formik.touched.email && formik.errors.email && (
          <p className="text-destructive text-xs">{formik.errors.email}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone *</Label>
        <Input placeholder="08123456789" {...f("phone")} />
        {formik.touched.phone && formik.errors.phone && (
          <p className="text-destructive text-xs">{formik.errors.phone}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="city">City *</Label>
        <Input placeholder="Jakarta" {...f("city")} />
        {formik.touched.city && formik.errors.city && (
          <p className="text-destructive text-xs">{formik.errors.city}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="province">Province *</Label>
        <Input placeholder="DKI Jakarta" {...f("province")} />
        {formik.touched.province && formik.errors.province && (
          <p className="text-destructive text-xs">{formik.errors.province}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="country">Country *</Label>
        <Input placeholder="Indonesia" {...f("country")} />
        {formik.touched.country && formik.errors.country && (
          <p className="text-destructive text-xs">{formik.errors.country}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="postalCode">Postal Code</Label>
        <Input placeholder="12345" {...f("postalCode")} />
        {formik.touched.postalCode && formik.errors.postalCode && (
          <p className="text-destructive text-xs">{formik.errors.postalCode}</p>
        )}
      </div>
      <div className="col-span-2 space-y-1.5">
        <Label htmlFor="address">Address *</Label>
        <Input placeholder="Jl. Sudirman No. 1" {...f("address")} />
        {formik.touched.address && formik.errors.address && (
          <p className="text-destructive text-xs">{formik.errors.address}</p>
        )}
      </div>
    </div>
  );
}

// ── Create Dialog ─────────────────────────────────────────────────────────────
function CreateSupplierDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { formik, isLoading } = useCreateSupplier({ onSuccess: () => setOpen(false) });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="text-primary h-5 w-5" />Add New Supplier
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4 pt-2">
          <SupplierFormFields formik={formik} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={formik.isSubmitting || isLoading}>
              {formik.isSubmitting ? "Saving..." : "Add Supplier"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Dialog ───────────────────────────────────────────────────────────────
function EditSupplierDialog({ supplier, trigger }: { supplier: Supplier; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { formik, isLoading } = useUpdateSupplier({ onSuccess: () => setOpen(false), initialData: supplier });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="text-primary h-5 w-5" />Edit Supplier
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4 pt-2">
          <SupplierFormFields formik={formik} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={formik.isSubmitting || isLoading}>
              {formik.isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Detail Dialog ─────────────────────────────────────────────────────────────
function SupplierDetailDialog({ supplier, trigger }: { supplier: Supplier; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const Row = ({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) =>
    value ? (
      <div className="flex items-start gap-3">
        <div className="bg-muted mt-0.5 rounded-md p-1.5">
          <Icon className="text-muted-foreground h-3.5 w-3.5" />
        </div>
        <div>
          <p className="text-muted-foreground text-xs">{label}</p>
          <p className="text-sm font-medium">{value}</p>
        </div>
      </div>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
              <Building2 className="text-primary h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{supplier.name}</DialogTitle>
              <p className="text-muted-foreground text-xs">Supplier Details</p>
            </div>
          </div>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <Row icon={Mail} label="Email" value={supplier.email} />
          <Row icon={Phone} label="Phone" value={supplier.phone} />
          <Row icon={MapPin} label="City" value={supplier.city} />
          <Row icon={MapPin} label="Province" value={supplier.province} />
          <Row icon={Building2} label="Country" value={supplier.country} />
          <Row icon={MapPin} label="Postal Code" value={supplier.postalCode} />
          <Row icon={MapPin} label="Address" value={supplier.address} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function SupplierPage() {
  const { filtered, isLoading, search, setSearch, handleDelete, stats } = useSupplierList();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <Truck className="text-primary h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
            <p className="text-muted-foreground text-sm">Manage your supplier network</p>
          </div>
        </div>
        <CreateSupplierDialog
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />Add Supplier
            </Button>
          }
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Suppliers", value: stats.total, color: "text-blue-600", bg: "bg-blue-500/10" },
          { label: "Active", value: stats.active, color: "text-green-600", bg: "bg-green-500/10" },
          { label: "Cities", value: stats.cities, color: "text-purple-600", bg: "bg-purple-500/10" }
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border p-4">
            <div className={`mb-3 inline-flex rounded-lg p-2 ${s.bg}`}>
              <Truck className={`h-4 w-4 ${s.color}`} />
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
              placeholder="Search by name, email, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Badge variant="secondary">{filtered.length} suppliers</Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Province</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground py-12 text-center">
                  <Truck className="mx-auto mb-3 h-8 w-8 opacity-30" />
                  {search ? "No suppliers match your search." : "No suppliers yet. Add your first one!"}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((supplier) => (
                <TableRow key={supplier.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-muted text-muted-foreground flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold">
                        {supplier.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{supplier.name}</p>
                        <p className="text-muted-foreground text-xs">{supplier.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{supplier.phone ?? "—"}</TableCell>
                  <TableCell className="text-sm">{supplier.city ?? "—"}</TableCell>
                  <TableCell className="text-sm">{supplier.province ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <SupplierDetailDialog
                            supplier={supplier}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Building2 className="mr-2 h-4 w-4" />View Details
                              </DropdownMenuItem>
                            }
                          />
                          <EditSupplierDialog
                            supplier={supplier}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Pencil className="mr-2 h-4 w-4" />Edit
                              </DropdownMenuItem>
                            }
                          />
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the supplier
                            "{supplier.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(supplier.id, supplier.name)}
                            className="bg-destructive text-destructive-foreground text-white hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
