"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useGetAllUsersQuery } from "@/store/services/user.service";
import { Loader2 } from "lucide-react";
import { AddUserDialog } from "./AddUserDialog";
import UsersDataTable from "./UsersDataTable";

export const UserPage = () => {
  const { data: usersData, isLoading, isError } = useGetAllUsersQuery();

  // Extract users from the API response
  // The API returns { message: string, data: User[] }
  const users = usersData?.data || [];

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
        Failed to load users. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <AddUserDialog />
      </div>
      <Card>
        <CardContent className="px-4">
          <UsersDataTable data={users} />
        </CardContent>
      </Card>
    </div>
  );
};
