"use client";

import { useGetProfileQuery } from "@/store/services/auth.service";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function PosLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: profileData, isLoading } = useGetProfileQuery();
  const userRole = profileData?.data?.role;

  useEffect(() => {
    if (!isLoading && userRole && userRole !== "cashier") {
      router.push("/access-denied");
    }
  }, [userRole, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (userRole && userRole !== "cashier") {
    return null;
  }

  return <>{children}</>;
}
