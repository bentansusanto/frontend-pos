import React from "react";
import { useGetUserByIdQuery } from "@/store/services/user.service";
import { Skeleton } from "@/components/ui/skeleton";

interface UserNameProps {
  id: string;
  className?: string;
}

export const UserName: React.FC<UserNameProps> = ({ id, className }) => {
  const { data: user, isLoading } = useGetUserByIdQuery(id, { skip: !id });

  if (isLoading) return <Skeleton className="h-4 w-24" />;
  if (!id) return <span>N/A</span>;
  if (!user) return <span>{id}</span>;

  return <span className={className}>{user.name}</span>;
};
