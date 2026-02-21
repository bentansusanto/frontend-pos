"use client";

import { useGetAllCustomersQuery } from "@/store/services/customer.service";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { CreateCustomerDialog } from "./create-customer-dialog";

export default function CustomersPage() {
  const { data: customersResponse, isLoading, isError } = useGetAllCustomersQuery();
  const customers = customersResponse?.data || [];

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <CreateCustomerDialog />
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div>Error loading customers</div>
      ) : (
        <DataTable columns={columns} data={customers} searchKey="name" />
      )}
    </div>
  );
}
