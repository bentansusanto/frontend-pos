"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

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
import { Button } from "@/components/ui/button";
import { useDeleteCustomerMutation } from "@/store/services/customer.service";
import { Customer } from "@/types/customer.type";

interface DeleteCustomerDialogProps {
  customer: Customer;
}

export function DeleteCustomerDialog({ customer }: DeleteCustomerDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleteCustomer, { isLoading }] = useDeleteCustomerMutation();

  async function onDelete() {
    try {
      await deleteCustomer(customer.id).unwrap();
      toast.success("Customer deleted successfully");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to delete customer");
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the customer
            <span className="font-semibold text-foreground"> {customer.name} </span>
            and remove their data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
