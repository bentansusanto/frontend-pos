"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const AccessDeniedPage = () => {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8 text-center">
      <div className="relative mb-8 h-64 w-64 sm:h-80 sm:w-80 lg:h-96 lg:w-96">
        <Image
          src="/images/page-access-denied.svg"
          alt="Access Denied Illustration"
          fill
          className="object-contain"
          priority
        />
      </div>

      <div className="max-w-md space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Access Denied
        </h1>
        <p className="text-lg text-muted-foreground">
          Sorry, you don't have permission to access this page. Please contact your administrator if
          you believe this is a mistake.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center pt-4">
         
          <Button asChild size="lg">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
