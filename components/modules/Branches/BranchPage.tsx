"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useGetBranchesQuery } from "@/store/services/branch.service";
import { Loader2 } from "lucide-react";
import { AddBranchDialog } from "./AddBranchDialog";
import BranchesDataTable from "./BranchesDataTable";

export const BranchPage = () => {
  const { data: branchesData, isLoading, isError } = useGetBranchesQuery();

  const branches = branchesData?.data || [];

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
        Failed to load branches. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Branches</h1>
        <AddBranchDialog />
      </div>
      <Card>
        <CardContent className="p-6">
          <BranchesDataTable data={branches} />
        </CardContent>
      </Card>
    </div>
  );
};
