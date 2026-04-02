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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { type Tax } from "@/store/services/tax.service";
import { MoreHorizontal, Pencil, Percent, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCreateTax, useTaxList, useUpdateTax } from "./hooks";

// ── Create Dialog ─────────────────────────────────────────────────────────────
function CreateTaxDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { formik, isLoading } = useCreateTax({ onSuccess: () => setOpen(false) });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Percent className="text-primary h-5 w-5" />
            Add New Tax
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Tax Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="PPN 11%"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-destructive text-xs">{formik.errors.name}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rate">Rate (%) *</Label>
            <div className="relative">
              <Input
                id="rate"
                name="rate"
                type="number"
                step="0.01"
                min={0}
                max={100}
                value={formik.values.rate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="pr-8"
              />
              <span className="text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 text-sm">%</span>
            </div>
            {formik.touched.rate && formik.errors.rate && (
              <p className="text-destructive text-xs">{formik.errors.rate}</p>
            )}
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Inclusive Tax</p>
              <p className="text-muted-foreground text-xs">Tax included in the price</p>
            </div>
            <Switch
              checked={formik.values.is_inclusive}
              onCheckedChange={(v) => formik.setFieldValue("is_inclusive", v)}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-muted-foreground text-xs">Available for orders</p>
            </div>
            <Switch
              checked={formik.values.is_active}
              onCheckedChange={(v) => formik.setFieldValue("is_active", v)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={formik.isSubmitting || isLoading}>
              {formik.isSubmitting ? "Saving..." : "Add Tax"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Dialog ───────────────────────────────────────────────────────────────
function EditTaxDialog({ tax, trigger }: { tax: Tax; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { formik, isLoading } = useUpdateTax({ onSuccess: () => setOpen(false), initialData: tax });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Percent className="text-primary h-5 w-5" />
            Edit Tax
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Tax Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="PPN 11%"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-destructive text-xs">{formik.errors.name}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rate">Rate (%) *</Label>
            <div className="relative">
              <Input
                id="rate"
                name="rate"
                type="number"
                step="0.01"
                min={0}
                max={100}
                value={formik.values.rate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="pr-8"
              />
              <span className="text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 text-sm">%</span>
            </div>
            {formik.touched.rate && formik.errors.rate && (
              <p className="text-destructive text-xs">{formik.errors.rate}</p>
            )}
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Inclusive Tax</p>
              <p className="text-muted-foreground text-xs">Tax included in the price</p>
            </div>
            <Switch
              checked={formik.values.is_inclusive}
              onCheckedChange={(v) => formik.setFieldValue("is_inclusive", v)}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-muted-foreground text-xs">Available for orders</p>
            </div>
            <Switch
              checked={formik.values.is_active}
              onCheckedChange={(v) => formik.setFieldValue("is_active", v)}
            />
          </div>
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

// ── Main Page ─────────────────────────────────────────────────────────────────
export function TaxPage() {
  const { filtered, isLoading, search, setSearch, handleDelete, stats } = useTaxList();

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 min-h-screen bg-transparent">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
            <Percent className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tax Settings</h1>
            <p className="text-muted-foreground text-sm">Manage taxes applied to orders</p>
          </div>
        </div>
        <CreateTaxDialog trigger={<Button className="gap-2"><Plus className="h-4 w-4" />Add Tax</Button>} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Taxes", value: stats.total, color: "text-blue-600" },
          { label: "Active", value: stats.active, color: "text-green-600" },
          { label: "Avg Rate", value: `${stats.avgRate}%`, color: "text-amber-600" }
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border p-4 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-muted-foreground mt-1 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border min-w-0">
        <div className="flex items-center gap-3 border-b p-4">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input className="pl-9" placeholder="Search taxes..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Name</TableHead>
              <TableHead className="whitespace-nowrap">Rate</TableHead>
              <TableHead className="whitespace-nowrap">Type</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : filtered.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground py-12 text-center">
                    <Percent className="mx-auto mb-3 h-8 w-8 opacity-30" />No taxes found.
                  </TableCell>
                </TableRow>
              )
              : filtered.map((tax) => (
                  <TableRow key={tax.id} className="group">
                    <TableCell className="font-medium">{tax.name}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-amber-600">{tax.rate}%</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={tax.is_inclusive ? "secondary" : "outline"} className="text-xs">
                        {tax.is_inclusive ? "Inclusive" : "Exclusive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={tax.is_active ? "bg-green-500/10 text-green-700 hover:bg-green-500/20" : "bg-gray-100 text-gray-600"}>
                        {tax.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <EditTaxDialog
                            tax={tax}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Pencil className="mr-2 h-4 w-4" />Edit
                              </DropdownMenuItem>
                            }
                          />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(tax.id, tax.name)}>
                            <Trash2 className="mr-2 h-4 w-4" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  );
}
