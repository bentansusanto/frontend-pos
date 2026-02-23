"use client";

import { useGetProfileQuery } from "@/store/services/auth.service";
import { useGetBranchesQuery } from "@/store/services/branch.service";
import {
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconInnerShadowTop,
  IconUsers
} from "@tabler/icons-react";
import * as React from "react";
import { useEffect, useState } from "react";

import { NavUser } from "@/components/nav-user";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from "@/components/ui/sidebar";
import { getCookie, setCookie } from "@/utils/cookies";
import { Check, ChevronsUpDown, CirclePercent, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";

const data = {
  brand: {
    name: "Nexus POS",
    description: "Main Branch • Admin"
  },
  user: {
    name: "Alex Johnson",
    email: "Manager",
    avatar: "https://i.pravatar.cc/150?img=32"
  },
  primary: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard
    }
  ],
  sections: [
    {
      label: "Sales & Operations",
      items: [
        {
          title: "POS / Sales",
          icon: CirclePercent,
          defaultOpen: true,
          items: [
            { title: "New Order", url: "/dashboard/pos/new-order" },
            { title: "Transactions", url: "/dashboard/pos/transactions" }
          ],
          roles: ["cashier"]
        },
        {
          title: "Customers",
          icon: IconUsers,
          url: "/dashboard/customers",
          roles: ["owner", "super_admin", "admin", "cashier"]
        },
        {
          title: "Inventory",
          icon: IconFolder,
          defaultOpen: true,
          items: [
            { title: "Products", url: "/dashboard/inventory/products" },
            { title: "Stock Overview", url: "/dashboard/inventory/stock-overview" }
          ],
          roles: ["owner", "admin", "cashier"]
        },
        {
          title: "Reports",
          icon: IconChartBar,
          defaultOpen: true,
          items: [{ title: "Sales Report", url: "/dashboard/reports/sales-report" }],
          roles: ["owner", "admin"]
        }
      ]
    },
    {
      label: "Intelligence",
      items: [
        {
          title: "AI Insights",
          icon: Sparkles,
          url: "/dashboard/ai-insights",
          roles: ["owner"]
        }
      ]
    },
    {
      label: "System",
      items: [
        {
          title: "User Settings",
          icon: IconUsers,
          defaultOpen: true,
          items: [
            { title: "Users", url: "/dashboard/users" },
            { title: "Branch", url: "/dashboard/branches" }
          ],
          roles: ["owner"]
        }
      ]
    }
  ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: profileData } = useGetProfileQuery();
  const user = profileData?.data;

  // Fetch all branches if user is owner
  const { data: branchesData } = useGetBranchesQuery(undefined, {
    skip: user?.role !== "owner"
  });

  const availableBranches =
    user?.role === "owner" ? branchesData?.data || [] : user?.branches || [];

  // Branch Selection Logic
  const [selectedBranch, setSelectedBranch] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (availableBranches.length > 0) {
      const savedBranchId = getCookie("pos_branch_id");
      const savedBranch = availableBranches.find((b: any) => b.id === savedBranchId);

      if (savedBranch) {
        setSelectedBranch(savedBranch);
      } else {
        // Default to first branch
        const defaultBranch = availableBranches[0];
        setSelectedBranch(defaultBranch);
        setCookie("pos_branch_id", defaultBranch.id);
      }
    }
  }, [availableBranches]);

  const handleBranchChange = (branch: { id: string; name: string }) => {
    setSelectedBranch(branch);
    setCookie("pos_branch_id", branch.id);
    window.location.reload(); // Refresh to update context
  };

  const sidebarUser = user
    ? {
        name: user.name,
        email: user.email,
        avatar: data.user.avatar
      }
    : data.user;

  const userRole = user?.role;

  // Filter sections based on user role
  const filteredSections = data.sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!item.roles) return true;
        return item.roles.includes(userRole);
      })
    }))
    .filter((section) => section.items.length > 0);

  // Filter primary items based on user role
  const filteredPrimary = data.primary.filter((item) => {
    // @ts-ignore
    if (!item.roles) return true;
    // @ts-ignore
    return item.roles.includes(userRole);
  });

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {availableBranches.length > 1 ||
            (user?.role === "owner" && availableBranches.length > 0) ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                    <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                      <IconInnerShadowTop className="size-4" />
                    </div>
                    <div className="space-y-3">
                    <div className="flex flex-1 text-left text-sm leading-tight"> <br />
                      <span className="truncate font-semibold">{data.brand.name}</span>
                    </div>
                      <span className="truncate text-xs">
                        {selectedBranch?.name || "Select Branch"}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  align="start"
                  side="bottom"
                  sideOffset={4}>
                  <DropdownMenuLabel className="text-muted-foreground text-xs">
                    Switch Branch
                  </DropdownMenuLabel>
                  {availableBranches.map((branch: any) => (
                    <DropdownMenuItem
                      key={branch.id}
                      onClick={() => handleBranchChange(branch)}
                      className="gap-2 p-2">
                      <div className="flex size-6 items-center justify-center rounded-sm border">
                        <IconInnerShadowTop className="size-4 shrink-0" />
                      </div>
                      {branch.name}
                      {selectedBranch?.id === branch.id && <Check className="ml-auto size-4" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1!">
                <Link href="/dashboard" className="flex items-center gap-3">
                  <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg">
                    <IconInnerShadowTop className="size-5" />
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="text-base font-semibold">{data.brand.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {selectedBranch?.name || data.brand.description}
                    </span>
                  </span>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {filteredPrimary.length > 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredPrimary.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.url !== "#" && pathname === item.url}
                      tooltip={item.title}
                      className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold">
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {filteredSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item: any) =>
                  item.items ? (
                    <Collapsible key={item.title} defaultOpen={item.defaultOpen}>
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title}>
                            <item.icon />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem: any) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={subItem.url !== "#" && pathname === subItem.url}
                                  className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold">
                                  <Link href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.url !== "#" && pathname === item.url}
                        tooltip={item.title}
                        className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold">
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
