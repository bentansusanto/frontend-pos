"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
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
import { useGetStockMovementsQuery } from "@/store/services/stock-movements.service";
import {
  ArrowDownRight,
  ArrowRightLeft,
  ArrowUpRight,
  Filter,
  Package,
  RefreshCcw,
  Search
} from "lucide-react";
import React, { useMemo, useState } from "react";

const MOVEMENT_TYPES = {
  sale: { label: "Sale", color: "destructive", icon: ArrowDownRight },
  purchase: { label: "Purchase", color: "default", icon: ArrowUpRight },
  adjust: { label: "Adjustment", color: "secondary", icon: ArrowRightLeft }
};

export default function StockOverviewPage() {
  const { data: movementsData, isLoading, refetch } = useGetStockMovementsQuery();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and sort data
  const filteredMovements = useMemo(() => {
    if (!movementsData) return [];

    return movementsData.filter((movement: any) => {
      const productName = movement.product?.name || "";
      const variantName = movement.productVariant?.name || "";
      const searchString = `${productName} ${variantName} ${movement.referenceId}`.toLowerCase();

      const matchesSearch = searchString.includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || movement.referenceType === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [movementsData, searchTerm, typeFilter]);

  // Pagination logic
  const totalItems = filteredMovements.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMovements.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMovements, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter]);

  // Metrics
  const metrics = useMemo(() => {
    if (!movementsData) return { total: 0, sale: 0, purchase: 0, adjust: 0 };
    return movementsData.reduce(
      (acc: any, curr: any) => {
        acc.total++;
        if (curr.referenceType) {
          acc[curr.referenceType] = (acc[curr.referenceType] || 0) + 1;
        }
        return acc;
      },
      { total: 0, sale: 0, purchase: 0, adjust: 0 }
    );
  }, [movementsData]);

  const indexOfFirstItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Stock Overview</h3>
        <p className="text-sm text-slate-500">Track all inventory movements and adjustments.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Movements</CardTitle>
            <Package className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-muted-foreground text-xs">All time records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Out</CardTitle>
            <ArrowDownRight className="text-destructive h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.sale}</div>
            <p className="text-muted-foreground text-xs">Stock deductions from sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchases In</CardTitle>
            <ArrowUpRight className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.purchase}</div>
            <p className="text-muted-foreground text-xs">Stock additions from purchases</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adjustments</CardTitle>
            <ArrowRightLeft className="text-secondary-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.adjust}</div>
            <p className="text-muted-foreground text-xs">Manual stock corrections</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Stock Movements</CardTitle>
              <CardDescription>Detailed log of stock changes.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                <Input
                  placeholder="Search product, variant, or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="adjust">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead className="text-right">Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Loading stock movements...
                      </TableCell>
                    </TableRow>
                  ) : currentItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No movements found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentItems.map((movement: any) => {
                      const typeConfig =
                        MOVEMENT_TYPES[movement.referenceType as keyof typeof MOVEMENT_TYPES] ||
                        MOVEMENT_TYPES.adjust;
                      const TypeIcon = typeConfig.icon;

                      return (
                        <TableRow key={movement.id}>
                          <TableCell className="font-medium">
                            {new Date(movement.createdAt).toLocaleDateString("id-ID", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </TableCell>
                          <TableCell>{movement.product?.name || "-"}</TableCell>
                          <TableCell>
                            {movement.productVariant?.name ? (
                              <Badge variant="outline">{movement.productVariant.name}</Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={typeConfig.color as any}
                              className="flex w-fit items-center gap-1">
                              <TypeIcon className="h-3 w-3" />
                              {typeConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className={`text-right font-bold ${
                              movement.referenceType === "sale" ||
                              (movement.referenceType === "adjust" && movement.qty < 0)
                                ? "text-destructive"
                                : "text-green-600"
                            }`}>
                            {movement.referenceType === "sale"
                              ? `-${movement.qty}`
                              : movement.qty > 0
                                ? `+${movement.qty}`
                                : movement.qty}
                          </TableCell>
                          <TableCell>{movement.branch?.name || "-"}</TableCell>
                          <TableCell className="text-muted-foreground text-right font-mono text-xs">
                            {movement.referenceId}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalItems > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground text-sm">
                  Showing {indexOfFirstItem} to {indexOfLastItem} of {totalItems} entries
                </div>

                <Pagination className="mx-0 w-auto justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage - 1);
                        }}
                        className={
                          currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        return (
                          page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, index, array) => {
                        const prevPage = array[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;

                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && (
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                href="#"
                                isActive={currentPage === page}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(page);
                                }}>
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        );
                      })}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage + 1);
                        }}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
