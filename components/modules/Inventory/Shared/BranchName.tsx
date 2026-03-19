import React from "react";
import { useGetBranchByIdQuery } from "@/store/services/branch.service";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface BranchNameProps {
  id: string;
  className?: string;
  showBadge?: boolean;
}

export const BranchName: React.FC<BranchNameProps> = ({ id, className, showBadge = false }) => {
  const { data: branch, isLoading } = useGetBranchByIdQuery(id, { skip: !id });

  if (isLoading) return <Skeleton className="h-4 w-24" />;
  if (!id) return <span>N/A</span>;
  if (!branch) return <span>{id}</span>;

  if (showBadge) {
    return (
      <Badge variant="outline" className={className}>
        {branch.name}
      </Badge>
    );
  }

  return <span className={className}>{branch.name}</span>;
};
