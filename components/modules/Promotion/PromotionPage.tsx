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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  Zap,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  PlusCircle,
  MinusCircle
} from "lucide-react";
import { useState } from "react";
import { usePromotionList, useCreatePromotion, useUpdatePromotion, getPromotionStatus } from "./hooks";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetBranchesQuery } from "@/store/services/branch.service";
import { useGetVariantProductsQuery } from "@/store/services/product.service";
import { useGetAllCategoriesQuery } from "@/store/services/category.service";


import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

// ── MultiSelect Component ──────────────────────────────────────────────────────
function MultiSelect({ 
  label, 
  options, 
  selectedIds, 
  onChange, 
  placeholder = "Select items..." 
}: { 
  label: string; 
  options: { id: string; name: string }[]; 
  selectedIds: string[]; 
  onChange: (ids: string[]) => void;
  placeholder?: string;
}) {
  const [search, setSearch] = useState("");
  
  const toggle = (id: string) => {
    const newIds = selectedIds.includes(id) 
      ? selectedIds.filter(i => i !== id) 
      : [...selectedIds, id];
    onChange(newIds);
  };

  const filteredOptions = options.filter(opt => 
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedNames = options
    .filter(opt => selectedIds.includes(opt.id))
    .map(opt => opt.name);

  const buttonText = selectedNames.length > 0 
    ? (selectedNames.length <= 2 
        ? selectedNames.join(", ") 
        : `${selectedNames.slice(0, 2).join(", ")} +${selectedNames.length - 2} more`)
    : placeholder;

  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "w-full justify-start font-normal h-9 px-3 truncate transition-all",
              selectedIds.length > 0 && "border-violet-200 bg-violet-50/30 text-violet-700"
            )}
          >
            <div className="truncate flex-1 text-left">
              {buttonText}
            </div>
            {selectedIds.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1 bg-violet-100 text-violet-700 text-[10px] border-none">
                {selectedIds.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0 shadow-xl" align="start">
          <div className="p-2 border-b bg-muted/20">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-xs bg-background"
              />
            </div>
          </div>
          <ScrollArea className="h-64 p-1">
            <div className="space-y-0.5">
              {filteredOptions.length === 0 && (
                <div className="py-6 text-center text-xs text-muted-foreground italic">
                  No items found
                </div>
              )}
              {filteredOptions.map((opt) => (
                <div 
                  key={opt.id} 
                  className={cn(
                    "flex items-center space-x-2 rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer transition-colors",
                    selectedIds.includes(opt.id) && "bg-violet-50/50"
                  )}
                  onClick={() => toggle(opt.id)}
                >
                  <Checkbox 
                    checked={selectedIds.includes(opt.id)} 
                    onCheckedChange={() => toggle(opt.id)}
                    className="h-3.5 w-3.5"
                  />
                  <span className={cn(
                    "text-xs truncate flex-1",
                    selectedIds.includes(opt.id) && "font-medium text-violet-700"
                  )}>
                    {opt.name}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
          {selectedIds.length > 0 && (
            <div className="p-2 border-t bg-muted/10">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onChange([])}
                className="w-full h-7 text-[10px] uppercase font-bold tracking-tight text-muted-foreground hover:text-destructive"
              >
                Clear Selections
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ── Rule Form Component ───────────────────────────────────────────────────────
function RuleForm({ 
  rule, 
  index, 
  formik, 
  variants, 
  categories 
}: { 
  rule: any; 
  index: number; 
  formik: any;
  variants: any[];
  categories: any[];
}) {
  const removeRule = () => {
    const newRules = [...formik.values.rules];
    newRules.splice(index, 1);
    formik.setFieldValue("rules", newRules);
  };

  return (
    <div className="relative space-y-4 rounded-xl border bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="bg-background">Rule #{index + 1}</Badge>
        {formik.values.rules.length > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={removeRule}
          >
            <MinusCircle className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Condition */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Condition</Label>
          <div className="space-y-2">
            <Select
              value={rule.conditionType}
              onValueChange={(v) => formik.setFieldValue(`rules.${index}.conditionType`, v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALWAYS_TRUE">Always True (Global)</SelectItem>
                <SelectItem value="MIN_QTY">Minimum Quantity</SelectItem>
                <SelectItem value="MIN_SPEND">Minimum Spend</SelectItem>
                <SelectItem value="PRODUCT_COMBO">Product Combo</SelectItem>
              </SelectContent>
            </Select>

            {rule.conditionType === "MIN_QTY" && (
              <Input
                type="number"
                placeholder="Min Qty"
                value={rule.conditionValue?.minQty || ""}
                onChange={(e) => formik.setFieldValue(`rules.${index}.conditionValue`, { minQty: Number(e.target.value) })}
              />
            )}

            {rule.conditionType === "MIN_SPEND" && (
              <Input
                type="number"
                placeholder="Min Spend ($)"
                value={rule.conditionValue?.minSpend || ""}
                onChange={(e) => formik.setFieldValue(`rules.${index}.conditionValue`, { minSpend: Number(e.target.value) })}
              />
            )}

            {rule.conditionType !== "ALWAYS_TRUE" && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <MultiSelect
                  label="Tgt. Variants (Cond)"
                  options={variants.map(v => ({ 
                    id: v.id, 
                    name: v.display_name || `${v.product_name || v.product?.name_product || "Product"} - ${v.name_variant || v.sku}` 
                  }))}
                  selectedIds={rule.conditionVariantIds || []}
                  onChange={(ids) => formik.setFieldValue(`rules.${index}.conditionVariantIds`, ids)}
                />
                <MultiSelect
                  label="Tgt. Categories (Cond)"
                  options={categories.map(c => ({ id: c.id, name: c.name }))}
                  selectedIds={rule.conditionCategoryIds || []}
                  onChange={(ids) => formik.setFieldValue(`rules.${index}.conditionCategoryIds`, ids)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Action</Label>
          <div className="space-y-2">
            <Select
              value={rule.actionType}
              onValueChange={(v) => formik.setFieldValue(`rules.${index}.actionType`, v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENT_DISCOUNT">Percentage Discount</SelectItem>
                <SelectItem value="FIXED_DISCOUNT">Fixed Discount</SelectItem>
                <SelectItem value="FIXED_PRICE">Set Fixed Price</SelectItem>
                <SelectItem value="FREE_GIFT">Free Gift</SelectItem>
              </SelectContent>
            </Select>

            {(rule.actionType === "PERCENT_DISCOUNT" || rule.actionType === "FIXED_DISCOUNT" || rule.actionType === "FIXED_PRICE") && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {rule.actionType === "PERCENT_DISCOUNT" ? "%" : "$"}
                </span>
                <Input
                  type="number"
                  className="pl-8"
                  placeholder="Value"
                  value={rule.actionType === "PERCENT_DISCOUNT" ? rule.actionValue?.percentage : rule.actionValue?.amount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (rule.actionType === "PERCENT_DISCOUNT") {
                      formik.setFieldValue(`rules.${index}.actionValue`, { percentage: val });
                    } else {
                      formik.setFieldValue(`rules.${index}.actionValue`, { amount: val });
                    }
                  }}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-2">
              <MultiSelect
                label="Tgt. Variants (Action)"
                options={variants.map(v => ({ 
                  id: v.id, 
                  name: v.display_name || `${v.product_name || v.product?.name_product || "Product"} - ${v.name_variant || v.sku}` 
                }))}
                selectedIds={rule.actionVariantIds || []}
                onChange={(ids) => formik.setFieldValue(`rules.${index}.actionVariantIds`, ids)}
              />
              <MultiSelect
                label="Tgt. Categories (Action)"
                options={categories.map(c => ({ id: c.id, name: c.name }))}
                selectedIds={rule.actionCategoryIds || []}
                onChange={(ids) => formik.setFieldValue(`rules.${index}.actionCategoryIds`, ids)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Promotion Form Content ────────────────────────────────────────────────────
function PromotionForm({ formik, isLoading, onCancel, isEditing }: { formik: any; isLoading: boolean; onCancel: () => void; isEditing?: boolean }) {
  const { data: branches = [] } = useGetBranchesQuery();
  const { data: variants = [] } = useGetVariantProductsQuery();
  const { data: categories = [] } = useGetAllCategoriesQuery();

  const addRule = () => {
    formik.setFieldValue("rules", [
      ...formik.values.rules,
      {
        conditionType: "ALWAYS_TRUE",
        conditionValue: {},
        conditionVariantIds: [],
        conditionCategoryIds: [],
        actionType: "PERCENT_DISCOUNT",
        actionValue: { percentage: 0 },
        actionVariantIds: [],
        actionCategoryIds: []
      }
    ]);
  };

  const toggleBranch = (branchId: string) => {
    const current = [...formik.values.branchIds];
    const index = current.indexOf(branchId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(branchId);
    }
    formik.setFieldValue("branchIds", current);
  };

  return (
    <form onSubmit={formik.handleSubmit} className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 px-6 overflow-y-auto">
        <div className="space-y-6 pb-6 pt-2">
          {/* Header Info */}
          <section className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="name">Promotion Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ramadan Flash Sale"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-xs text-destructive">{formik.errors.name}</p>
                )}
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Internal notes or customer-facing description..."
                  className="resize-none"
                  rows={2}
                  value={formik.values.description || ""}
                  onChange={formik.handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formik.values.startDate}
                  onChange={formik.handleChange}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formik.values.endDate}
                  onChange={formik.handleChange}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="priority">Priority (Higher runs first)</Label>
                <Input
                  id="priority"
                  name="priority"
                  type="number"
                  value={formik.values.priority}
                  onChange={formik.handleChange}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={formik.values.status}
                  onValueChange={(v) => formik.setFieldValue("status", v)}
                >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Branch Selection */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Associated Branches</Label>
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-xs"
                onClick={() => formik.setFieldValue("branchIds", branches.map((b: any) => b.id))}
              >
                Select All
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/20 p-3">
              {branches.map((branch: any) => (
                <div key={branch.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`branch-${branch.id}`}
                    checked={formik.values.branchIds.includes(branch.id)}
                    onCheckedChange={() => toggleBranch(branch.id)}
                  />
                  <label
                    htmlFor={`branch-${branch.id}`}
                    className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {branch.name}
                  </label>
                </div>
              ))}
              {branches.length === 0 && <p className="col-span-2 text-center text-xs text-muted-foreground italic">No branches found</p>}
            </div>
            <p className="text-[10px] text-muted-foreground">Keep empty for global promotion (all branches)</p>
          </section>

          {/* Rules Builder */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold text-primary">Promotion Rules</Label>
                <Badge variant="secondary" className="px-1.5">{formik.values.rules.length}</Badge>
              </div>
              <Button type="button" variant="outline" size="sm" className="gap-1.5 h-8" onClick={addRule}>
                <PlusCircle className="h-3.5 w-3.5" />
                Add Rule
              </Button>
            </div>

            <div className="space-y-4">
              {formik.values.rules.map((rule: any, idx: number) => (
                <RuleForm 
                  key={idx} 
                  rule={rule} 
                  index={idx} 
                  formik={formik} 
                  variants={variants}
                  categories={categories}
                />
              ))}
            </div>
          </section>

          {/* Settings */}
          <section className="flex items-center justify-between rounded-xl border bg-violet-500/5 p-4">
            <div className="space-y-1">
              <Label className="font-semibold">Stackable Promotion</Label>
              <p className="text-xs text-muted-foreground">Can be combined with other active promotions</p>
            </div>
            <Switch
              checked={formik.values.isStackable}
              onCheckedChange={(v) => formik.setFieldValue("isStackable", v)}
            />
          </section>
        </div>
      </div>

      <div className="shrink-0 flex justify-end gap-3 p-6 bg-background border-t">
        {Object.keys(formik.errors).length > 0 && (
          <div className="mr-auto text-[10px] text-red-500 font-medium flex-col max-w-[250px] overflow-hidden truncate">
            <span>Validation failed:</span>
            <span>{JSON.stringify(formik.errors)}</span>
          </div>
        )}
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit"  className="min-w-[120px]">
          {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Promotion"}
        </Button>
      </div>
    </form>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function PromotionPage() {
  const { filtered, isLoading, search, setSearch, handleDelete, stats } = usePromotionList();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);

  const createFormik = useCreatePromotion({
    onSuccess: () => {
      setIsDialogOpen(false);
      setEditingPromotion(null);
    }
  });

  const updateFormik = useUpdatePromotion({
    onSuccess: () => {
      setIsDialogOpen(false);
      setEditingPromotion(null);
    },
    initialData: editingPromotion
  });

  const handleEdit = (promotion: any) => {
    setEditingPromotion(promotion);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingPromotion(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-transparent">
      {/* Header Section */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
            <Zap className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Promotions</h1>
            <p className="text-muted-foreground text-sm font-medium">Manage rules and branch-specific deals</p>
          </div>
        </div>
        <Button onClick={handleCreate} className="gap-2 rounded-lg">
          <Plus className="h-4 w-4" />
          Add Promotion
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total", value: stats.total, color: "text-violet-600", bg: "bg-violet-500/5", border: "border-violet-100" },
          { label: "Active", value: stats.active, color: "text-emerald-600", bg: "bg-emerald-500/5", border: "border-emerald-100" },
          { label: "Scheduled", value: stats.scheduled, color: "text-blue-600", bg: "bg-blue-500/5", border: "border-blue-100" },
          { label: "Expired", value: stats.expired, color: "text-rose-600", bg: "bg-rose-500/5", border: "border-rose-100" }
        ].map((s) => (
          <div key={s.label} className={cn("bg-card rounded-xl border p-4 shadow-sm", s.border, s.bg)}>
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-muted-foreground mt-1 text-xs font-medium uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main Table Section */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9 h-10 rounded-lg"
              placeholder="Search promotions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Badge variant="secondary" className="h-10 px-3 flex items-center">{filtered.length} items</Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Promotion</TableHead>
              <TableHead>Branches</TableHead>
              <TableHead>Rules</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  <Tag className="mx-auto mb-3 h-8 w-8 opacity-20" />
                  No promotions found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((promotion: any) => {
                const status = getPromotionStatus(promotion);
                return (
                  <TableRow key={promotion.id} className="group">
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-sm">{promotion.name}</span>
                        {promotion.priority > 0 && (
                          <span className="text-[10px] text-orange-600 font-bold uppercase">Priority: {promotion.priority}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {!promotion.branchIds || promotion.branchIds.length === 0 ? (
                          <span className="text-xs text-muted-foreground italic">Global (All)</span>
                        ) : (
                          <Badge variant="outline" className="text-[10px] font-bold">
                            {promotion.branchIds.length} Branches
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-bold bg-violet-100 text-violet-700">
                        {promotion.rules?.length || 0} Rules
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[11px] text-muted-foreground">
                      {format(new Date(promotion.startDate), "dd MMM")} – {format(new Date(promotion.endDate), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-[10px] font-bold", status.className)}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(promotion)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(promotion.id, promotion.name)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if(!open) setEditingPromotion(null);
      }}>
        <DialogContent className="sm:max-w-[640px] p-0 flex flex-col max-h-[90vh] overflow-hidden shadow-2xl">
          <div className="border-b p-6 pb-4 bg-muted/20 shrink-0">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-violet-600" />
                {editingPromotion ? "Edit Promotion" : "Add Promotion"}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <PromotionForm
              formik={editingPromotion ? updateFormik.formik : createFormik.formik}
              isLoading={editingPromotion ? updateFormik.isLoading : createFormik.isLoading}
              isEditing={!!editingPromotion}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingPromotion(null);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
