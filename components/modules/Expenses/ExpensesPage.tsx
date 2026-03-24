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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useGetProfileQuery } from "@/store/services/auth.service";
import {
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
  useGetExpenseCategoriesQuery,
  useGetExpensesQuery,
  useUpdateExpenseMutation,
  useCreateExpenseCategoryMutation
} from "@/store/services/expense.service";
import { format } from "date-fns";
import {
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Receipt,
  Search,
  Tags,
  Trash2,
  TrendingDown
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";


function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

function getCategoryLabel(categoryId: string, categories: any[]) {
  return categories.find((c) => c.id === categoryId)?.name ?? "Other";
}

// ── Create/Edit Form ──────────────────────────────────────────────────────────
interface ExpenseFormValues {
  date: string;
  description: string;
  category: string;
  amount: string;
  paidBy: string;
  notes: string;
}

function ExpenseForm({
  initial,
  onSubmit,
  onCancel,
  isSubmitting,
  categories
}: {
  initial?: Partial<ExpenseFormValues>;
  onSubmit: (values: ExpenseFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  categories: any[];
}) {
  const [values, setValues] = useState<ExpenseFormValues>({
    date: initial?.date ?? new Date().toISOString().slice(0, 10),
    description: initial?.description ?? "",
    category: initial?.category ?? "operational",
    amount: initial?.amount ?? "",
    paidBy: initial?.paidBy ?? "",
    notes: initial?.notes ?? ""
  });

  const set = (key: keyof ExpenseFormValues, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>Category *</Label>
          <Select
            value={values.category}
            onValueChange={(v) => set("category", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description *</Label>
        <Input
          id="description"
          placeholder="e.g. Monthly office rent"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount *</Label>
          <div className="relative">
            <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm italic">
              $
            </span>
            <Input
              id="amount"
              type="number"
              min={0}
              className="pl-8"
              placeholder="0"
              value={values.amount}
              onChange={(e) => set("amount", e.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="paidBy">Payment Method *</Label>
          <Input
            id="paidBy"
            placeholder="e.g. Cash, Transfer"
            value={values.paidBy}
            onChange={(e) => set("paidBy", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes..."
          className="resize-none"
          rows={2}
          value={values.notes}
          onChange={(e) => set("notes", e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}

// ── Add Dialog ────────────────────────────────────────────────────────────────
function AddExpenseDialog({
  trigger,
  categories
}: {
  trigger: React.ReactNode;
  categories: any[];
}) {
  const [open, setOpen] = useState(false);
  const { data: profileData } = useGetProfileQuery();
  const [createExpense, { isLoading }] = useCreateExpenseMutation();
  const branchId = profileData?.branches?.[0]?.id;

  const handleSubmit = async (values: ExpenseFormValues) => {
    try {
      await createExpense({
        expense_date: new Date(values.date).toISOString(),
        description: values.description,
        expense_category_id: values.category,
        amount: parseFloat(values.amount) || 0,
        payment_method: values.paidBy,
        notes: values.notes || undefined,
        branch_id: branchId
      }).unwrap();
      toast.success("Expense added successfully");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to add expense");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="text-primary h-5 w-5" />
            Add New Expense
          </DialogTitle>
        </DialogHeader>
        <ExpenseForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          categories={categories}
          isSubmitting={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Dialog ───────────────────────────────────────────────────────────────
function EditExpenseDialog({
  expense,
  trigger,
  categories
}: {
  expense: any;
  trigger: React.ReactNode;
  categories: any[];
}) {
  const [open, setOpen] = useState(false);
  const [updateExpense, { isLoading }] = useUpdateExpenseMutation();

  const handleSubmit = async (values: ExpenseFormValues) => {
    try {
      await updateExpense({
        id: expense.id,
        body: {
          expense_date: new Date(values.date).toISOString(),
          description: values.description,
          expense_category_id: values.category,
          amount: parseFloat(values.amount) || 0,
          payment_method: values.paidBy,
          notes: values.notes || undefined
        }
      }).unwrap();
      toast.success("Expense updated successfully");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to update expense");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="text-primary h-5 w-5" />
            Edit Expense
          </DialogTitle>
        </DialogHeader>
        <ExpenseForm
          initial={{
            date: expense.expense_date ? new Date(expense.expense_date).toISOString().slice(0, 10) : "",
            description: expense.description,
            category: expense.expense_category_id,
            amount: String(expense.amount),
            paidBy: expense.payment_method,
            notes: expense.notes ?? ""
          }}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          categories={categories}
          isSubmitting={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}

// ── Add Category Dialog ───────────────────────────────────────────────────────
function AddCategoryDialog({
  trigger
}: {
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [createCategory, { isLoading }] = useCreateExpenseCategoryMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory({ name }).unwrap();
      toast.success("Category added successfully");
      setName("");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to add category");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tags className="text-primary h-5 w-5" />
            Add Expense Category
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Category Name *</Label>
            <Input
              id="cat-name"
              placeholder="e.g. Marketing, Utilities"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function ExpensesPage() {
  const { data: expensesData, isLoading: isLoadingExpenses } = useGetExpensesQuery();
  const { data: categoriesData } = useGetExpenseCategoriesQuery();
  const [deleteExpense] = useDeleteExpenseMutation();

  const expenses = expensesData?.data || [];
  const categories = categoriesData?.data || [];

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return expenses.filter((e: any) => {
      const matchSearch =
        e.description.toLowerCase().includes(search.toLowerCase()) ||
        e.expense_code.toLowerCase().includes(search.toLowerCase()) ||
        e.payment_method.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === "all" || e.expense_category_id === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [expenses, search, categoryFilter]);

  const totalAmount = useMemo(() => filtered.reduce((s: number, e: any) => s + Number(e.amount), 0), [filtered]);
  const totalAll = useMemo(() => expenses.reduce((s: number, e: any) => s + Number(e.amount), 0), [expenses]);

  // Category breakdown for stats
  const byCat = useMemo(() => {
    return categories.map((c: any) => ({
      ...c,
      total: expenses.filter((e: any) => e.expense_category_id === c.id).reduce((s: number, e: any) => s + Number(e.amount), 0)
    })).filter((c: any) => Number(c.total) > 0);
  }, [categories, expenses]);

  const topCat = useMemo(() => {
    if (byCat.length === 0) return null;
    return [...byCat].sort((a: any, b: any) => b.total - a.total)[0];
  }, [byCat]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(id).unwrap();
        toast.success("Expense deleted successfully");
      } catch (error) {
        toast.error("Failed to delete expense");
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
            <TrendingDown className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
            <p className="text-muted-foreground text-sm">Track and manage all business expenses</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AddCategoryDialog
            trigger={
              <Button variant="outline" className="gap-2">
                <Tags className="h-4 w-4" />
                Add Category
              </Button>
            }
          />
          <AddExpenseDialog
            trigger={
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            }
            categories={categories}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Total Expenses",
            value: formatCurrency(totalAll),
            color: "text-red-600",
            bg: "bg-red-50 dark:bg-red-950/20"
          },
          {
            label: "This View",
            value: formatCurrency(totalAmount),
            color: "text-orange-600",
            bg: ""
          },
          {
            label: "Total Entries",
            value: String(expenses.length),
            color: "text-blue-600",
            bg: ""
          },
          {
            label: "Biggest Category",
            value: topCat ? topCat.name : "—",
            color: "text-violet-600",
            bg: ""
          }
        ].map((s) => (
          <div key={s.label} className={`bg-card rounded-xl border p-4 text-center ${s.bg}`}>
            <p className={`truncate text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-muted-foreground mt-1 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border">
        <div className="flex items-center gap-3 border-b p-4">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              className="pl-9"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="secondary">{filtered.length} entries</Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingExpenses ? (
              <TableRow>
                <TableCell colSpan={7} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">Loading expenses...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground py-12 text-center">
                  <Receipt className="mx-auto mb-3 h-8 w-8 opacity-30" />
                  No expenses found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((expense: any) => (
                <TableRow key={expense.id} className="group">
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {expense.expense_code}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {expense.expense_date ? format(new Date(expense.expense_date), "yyyy-MM-dd") : "-"}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{expense.description}</p>
                    {expense.notes && (
                      <p className="text-muted-foreground max-w-[200px] truncate text-xs">
                        {expense.notes}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                      {getCategoryLabel(expense.expense_category_id, categories)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{expense.payment_method}</TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-red-600">
                      {formatCurrency(Number(expense.amount))}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <EditExpenseDialog
                          expense={expense}
                          categories={categories}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          }
                        />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(expense.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Footer total */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <span className="text-muted-foreground text-sm">
              Showing {filtered.length} of {expenses.length} expenses
            </span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Total:</span>
              <span className="font-bold text-red-600">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
