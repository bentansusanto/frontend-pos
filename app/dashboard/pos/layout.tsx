"use client";

import { useGetProfileQuery } from "@/store/services/auth.service";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function PosLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: profileData, isLoading } = useGetProfileQuery();
  const userPermissions = profileData?.permissions || [];
  const canAccessPos = userPermissions.includes("orders:create") || userPermissions.includes("orders:read");

  useEffect(() => {
    if (!isLoading && profileData && !canAccessPos) {
      router.push("/access-denied");
    }
  }, [profileData, isLoading, canAccessPos, router]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (profileData && !canAccessPos) {
    return null;
  }

  return <>{children}</>;
}
