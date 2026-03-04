"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useGetAllPermissionsQuery } from "@/store/services/role.service";
import { Loader2 } from "lucide-react";
import PermissionsDataTable from "./PermissionsDataTable";
import { AddPermissionDialog } from "./AddPermissionDialog";

export const PermissionsPage = () => {
  const { data: permissionsData, isLoading, isError } = useGetAllPermissionsQuery();
  const permissions = permissionsData || [];

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center text-red-500">
        Failed to load permissions. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Permissions</h1>
      <div className="space-y-4">
        <div className="flex justify-end">
          <AddPermissionDialog />
        </div>
        <Card>
          <CardContent className="px-4">
            <PermissionsDataTable data={permissions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
