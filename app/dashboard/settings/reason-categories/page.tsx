"use client";

import React, { useMemo, useState } from "react";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Settings2,
  Filter
} from "lucide-react";
import { 
  useGetReasonCategoriesQuery, 
  useUpdateReasonCategoryMutation,
  ReasonCategory 
} from "@/store/services/reason-category.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ReasonCategoryModal } from "@/components/modules/Settings/ReasonCategoryModal";

export default function ReasonCategoriesPage() {
  const { data: categories, isLoading, refetch } = useGetReasonCategoriesQuery();
  const [updateCategory] = useUpdateReasonCategoryMutation();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ReasonCategory | null>(null);

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter(c => 
      c.label.toLowerCase().includes(search.toLowerCase()) || 
      c.type.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => a.type.localeCompare(b.type) || a.label.localeCompare(b.label));
  }, [categories, search]);

  const totalEntries = filteredCategories.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  
  // Reset page if search filters it out
  if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);

  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCategories.slice(startIndex, startIndex + pageSize);
  }, [filteredCategories, currentPage, pageSize]);

  const showingFrom = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showingTo = Math.min(currentPage * pageSize, totalEntries);

  const toggleActive = async (category: ReasonCategory) => {
    try {
      await updateCategory({ id: category.id, is_active: !category.is_active }).unwrap();
      toast.success(`${category.label} ${category.is_active ? 'deactivated' : 'activated'}`);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update category status");
    }
  };

  const handleEdit = (category: ReasonCategory) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Reason Categories</h3>
          <p className="text-sm text-muted-foreground italic">
            Configure default categories and behavioral rules for POS reasons.
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2 bg-primary hover:bg-primary/90 mt-4 sm:mt-0">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid gap-6">
        {/* ── Mini Stats (Mirroring Sales Report Style) ── */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="bg-gradient-to-br from-emerald-50/60 to-card dark:from-emerald-950/20 border shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Active Categories
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold tabular-nums">
                {categories?.filter(c => c.is_active).length || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50/60 to-card dark:from-amber-950/20 border shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Anomaly Triggers
              </span>
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold tabular-nums">
                {categories?.filter(c => c.is_anomaly_trigger).length || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50/60 to-card dark:from-indigo-950/20 border shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Total Workflows
              </span>
              <Settings2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold tabular-nums">
                {new Set(categories?.map(c => c.type)).size || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── Table Container ── */}
        <Card className="overflow-hidden shadow-sm border-none ring-1 ring-border">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Category Distribution</CardTitle>
                <CardDescription className="text-xs">Manage rules for Refunds and Session Closures.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search labels..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 w-[200px] pl-8 text-xs bg-background"
                  />
                </div>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Filter className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-sm text-muted-foreground animate-pulse">
                Loading categories...
              </div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-0">
                      {["Label", "Type", "Min Length", "AI Audit", "Status", ""].map((header) => (
                        <TableHead 
                          key={header} 
                          className={cn(
                            "py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6",
                            header === "" && "text-right"
                          )}
                        >
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCategories.length > 0 ? (
                      paginatedCategories.map((cat) => (
                        <TableRow 
                          key={cat.id} 
                          className={cn(
                            "group hover:bg-muted/30 transition-colors border-b last:border-0 text-xs",
                            !cat.is_active && "opacity-60"
                          )}
                        >
                          <TableCell className="py-4 px-6 font-semibold">
                            {cat.label}
                          </TableCell>
                          <TableCell className="py-4 px-6 uppercase tracking-wider text-[10px] font-bold opacity-70">
                            {cat.type.replace('_', ' ')}
                          </TableCell>
                          <TableCell className="py-4 px-6 tabular-nums">
                            {cat.min_description_length} chars
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            {cat.is_anomaly_trigger ? (
                              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-none rounded-sm px-2 text-[10px] items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> Enabled
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-[10px]">Disabled</span>
                            )}
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <Badge className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight border-none shadow-none",
                              cat.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                            )}>
                              {cat.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 px-6 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuLabel className="text-[10px] font-bold uppercase opacity-50 px-2.5">Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleEdit(cat)} className="gap-2 cursor-pointer">
                                  <Pencil className="h-3.5 w-3.5" /> Edit Category
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => toggleActive(cat)}
                                  className={cn(
                                    "gap-2 cursor-pointer",
                                    cat.is_active ? "text-destructive focus:text-destructive" : "text-emerald-600 focus:text-emerald-600"
                                  )}
                                >
                                  {cat.is_active ? (
                                    <><XCircle className="h-3.5 w-3.5" /> Deactivate</>
                                  ) : (
                                    <><CheckCircle2 className="h-3.5 w-3.5" /> Activate</>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="py-12 text-center text-muted-foreground italic">
                          No categories found matching your search.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* ── Dashboard-style Pagination Footer ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t bg-muted/5">
              <div className="text-xs text-muted-foreground font-medium grayscale opacity-80">
                Showing <span className="font-bold text-foreground">{showingFrom}</span> to <span className="font-bold text-foreground">{showingTo}</span> of <span className="font-bold text-foreground">{totalEntries}</span> entries
              </div>

              {totalPages > 1 && (
                <Pagination className="w-auto mx-0">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }).map((_, i) => {
                      const page = i + 1;
                      // Logic for showing neighbors if total pages > 5 (optional refinement)
                      if (totalPages > 5) {
                        const isNearCurrent = Math.abs(page - currentPage) <= 1;
                        const isStartOrEnd = page === 1 || page === totalPages;
                        if (!isNearCurrent && !isStartOrEnd) {
                          if (page === 2 || page === totalPages - 1) return <PaginationItem key={page}><PaginationEllipsis /></PaginationItem>;
                          return null;
                        }
                      }

                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            isActive={currentPage === page}
                            onClick={() => setCurrentPage(page)}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <ReasonCategoryModal 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        category={selectedCategory} 
      />
    </div>
  );
}
