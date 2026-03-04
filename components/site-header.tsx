"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useGetProfileQuery } from "@/store/services/auth.service";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import * as React from "react";

export function SiteHeader() {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const { data: profile } = useGetProfileQuery();
  const isActive = profile?.isActive ?? false;
  React.useEffect(() => setMounted(true), []);
  const title = React.useMemo(() => {
    if (!pathname) {
      return "Dashboard";
    }
    if (pathname === "/dashboard") {
      return "Dashboard";
    }
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) {
      return "Dashboard";
    }
    const lastSegment = segments[segments.length - 1];
    return lastSegment
      .split("-")
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ");
  }, [pathname]);
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          {/* Online / Offline badge */}
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
              isActive
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-gray-200 bg-gray-50 text-gray-500"
            )}>
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                isActive ? "animate-pulse bg-green-500" : "bg-gray-400"
              )}
            />
            {isActive ? "Online" : "Offline"}
          </div>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => {
              if (!mounted) {
                return;
              }
              setTheme(theme === "dark" ? "light" : "dark");
            }}>
            {mounted && theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
