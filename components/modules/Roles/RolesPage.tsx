"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useGetAllRolesQuery } from "@/store/services/role.service";
import { Loader2 } from "lucide-react";
import { AddRoleDialog } from "./AddRoleDialog";
import RolesDataTable from "./RolesDataTable";

export const RolesPage = () => {
  const { data: rolesResponse, isLoading, isError } = useGetAllRolesQuery();
  const roles = rolesResponse || [];

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
        Failed to load roles. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
      <div className="space-y-4">
        <div className="flex justify-end">
          <AddRoleDialog />
        </div>
        <Card>
          <CardContent className="px-4">
            <RolesDataTable data={roles} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
