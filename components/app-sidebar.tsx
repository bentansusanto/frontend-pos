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
import {
  BookOpen,
  Check,
  ChevronsUpDown,
  CirclePercent,
  ClipboardList,
  Receipt,
  Sparkles,
  Tag,
  Truck
} from "lucide-react";
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
      icon: IconDashboard,
      roles: ["owner", "admin", "super_admin"]
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
            { title: "Product Batches", url: "/dashboard/inventory/product-batches" },
            { title: "Stock Overview", url: "/dashboard/inventory/stock-overview" },
            { title: "Stock Take", url: "/dashboard/inventory/stock-take" }
          ],
          roles: ["owner", "admin"]
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
      label: "Marketing & Catalog",
      items: [
        {
          title: "Marketing and Tax",
          icon: Tag,
          defaultOpen: false,
          items: [
            { title: "Promotions", url: "/dashboard/finance/promotions" },
            { title: "Taxes", url: "/dashboard/finance/taxes" }
          ],
          roles: ["owner", "admin"]
        },
        {
          title: "Expenses",
          icon: Receipt,
          url: "/dashboard/finance/expenses",
          roles: ["owner", "admin"]
        },
        {
          title: "Accounting",
          icon: BookOpen,
          defaultOpen: false,
          items: [
            { title: "Journal", url: "/dashboard/finance/accounting/journal" },
            { title: "Balance Sheet", url: "/dashboard/finance/accounting/balance-sheet" },
            {
              title: "Cashflow Statement",
              url: "/dashboard/finance/accounting/cashflow-statement"
            },
            { title: "Income Statement", url: "/dashboard/finance/accounting/income-statement" }
          ],
          roles: ["owner", "admin"]
        },
        {
          title: "Suppliers",
          icon: Truck,
          url: "/dashboard/suppliers",
          roles: ["owner", "admin"]
        },
        {
          title: "Purchasing",
          icon: Truck,
          defaultOpen: false,
          items: [
            { title: "Purchase Orders", url: "/dashboard/purchasing" },
            { title: "Purchase Receiving", url: "/dashboard/purchasing/receiving" }
          ],
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
        },
        {
          title: "POS Log",
          icon: ClipboardList,
          url: "/dashboard/pos-log",
          roles: ["owner", "admin"]
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
            { title: "Branch", url: "/dashboard/branches", roles: ["owner"] },
            { title: "Roles", url: "/dashboard/settings/roles" },
            { title: "Permissions", url: "/dashboard/settings/permissions" }
          ],
          roles: ["owner", "admin"]
        },
        {
          title: "Activity Logs",
          icon: ClipboardList,
          url: "/dashboard/user-logs",
          roles: ["owner", "admin"]
        }
      ]
    }
  ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: user, isLoading: isLoadingProfile } = useGetProfileQuery();

  // Fetch all branches if user is owner
  const { data: branchesData, isLoading: isLoadingBranches } = useGetBranchesQuery(undefined, {
    skip: user?.role !== "owner"
  });

  const availableBranches = user?.role === "owner" ? branchesData || [] : user?.branches || [];

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
    : {
        name: isLoadingProfile ? "Loading..." : data.user.name,
        email: isLoadingProfile ? "Please wait" : data.user.email,
        avatar: data.user.avatar
      };

  const userRole = user?.role;

  // Filter sections based on user role
  const filteredSections =
    !userRole && isLoadingProfile
      ? []
      : data.sections
          .map((section) => ({
            ...section,
            items: section.items
              .filter((item) => {
                if (!item.roles) return true;
                return item.roles.includes(userRole);
              })
              .map((item: any) => ({
                ...item,
                items: item.items
                  ? item.items.filter((subItem: any) => {
                      if (!subItem.roles) return true;
                      return subItem.roles.includes(userRole);
                    })
                  : undefined
              }))
          }))
          .filter((section) => section.items.length > 0);

  // Filter primary items based on user role
  const filteredPrimary =
    !userRole && isLoadingProfile
      ? []
      : data.primary.filter((item) => {
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
            {isLoadingProfile || isLoadingBranches ? (
              <SidebarMenuButton size="lg">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Nexus POS</span>
                  <span className="truncate text-xs">Loading context...</span>
                </div>
              </SidebarMenuButton>
            ) : availableBranches.length > 1 ||
              (user?.role === "owner" && availableBranches.length > 0) ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                      <IconInnerShadowTop className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{data.brand.name}</span>
                      <span className="truncate text-xs">
                        {selectedBranch?.name || data.brand.description}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  align="start"
                  side="bottom"
                  sideOffset={4}>
                  <DropdownMenuLabel className="text-muted-foreground text-xs">
                    Branches
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
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                asChild>
                <Link href="/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <IconInnerShadowTop className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">{data.brand.name}</span>
                    <span className="text-xs text-sidebar-foreground/60">{selectedBranch?.name || "Enterprise"}</span>
                  </div>
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
