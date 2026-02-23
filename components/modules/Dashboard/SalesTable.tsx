import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface SalesTableProps {
  data: any[];
}

export function SalesTable({ data }: SalesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = data.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Sales Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((sale) => (
              <TableRow key={sale.paymentId}>
                <TableCell className="font-medium">{sale.orderId}</TableCell>
                <TableCell>{sale.customer?.name || "Guest"}</TableCell>
                <TableCell>{new Date(sale.paidAt).toLocaleDateString()}</TableCell>
                <TableCell>{formatCurrency(sale.totalAmount)}</TableCell>
                <TableCell className="capitalize">{sale.paymentMethod}</TableCell>
                <TableCell>
                  <Badge
                    variant={sale.status === "success" ? "default" : "secondary"}
                    className={
                      sale.status === "success" ? "bg-green-500 hover:bg-green-600" : ""
                    }>
                    {sale.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          Showing {totalItems > 0 ? startIndex + 1 : 0} to {endIndex} of {totalItems} entries
        </div>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage - 1);
                }}
                aria-disabled={currentPage === 1}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {/* We can add page numbers here if needed, but for now simple prev/next is good for "Recent" */}
            <PaginationItem>
              <PaginationLink href="#" isActive onClick={(e) => e.preventDefault()}>
                {currentPage}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage + 1);
                }}
                aria-disabled={currentPage === totalPages}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  );
}
