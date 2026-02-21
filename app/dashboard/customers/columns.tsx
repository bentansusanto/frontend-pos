"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Customer } from "@/types/customer.type";
import { UpdateCustomerDialog } from "./update-customer-dialog";
import { DeleteCustomerDialog } from "./delete-customer-dialog";
import { CustomerDetailsDialog } from "./customer-details-dialog";

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      return row.getValue("phone") || "-";
    },
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "loyalPoints",
    header: "Loyal Points",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const customer = row.original;

      return (
        <div className="flex items-center gap-2">
          <CustomerDetailsDialog customer={customer} />
          <UpdateCustomerDialog customer={customer} />
          <DeleteCustomerDialog customer={customer} />
        </div>
      );
    },
  },
];
