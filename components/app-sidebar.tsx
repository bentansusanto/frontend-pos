"use client";

import {
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconInnerShadowTop,
  IconUsers
} from "@tabler/icons-react";
import * as React from "react";

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
import { CirclePercent, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
            { title: "Transactions", url: "#" }
          ]
        },
        {
          title: "Inventory",
          icon: IconFolder,
          defaultOpen: true,
          items: [
            { title: "Products", url: "/dashboard/inventory/products" },
            { title: "Stock Overview", url: "#" },
            { title: "Add Stock", url: "#" }
          ]
        },
        {
          title: "Reports",
          icon: IconChartBar,
          defaultOpen: true,
          items: [{ title: "Sales Report", url: "#" }]
        }
      ]
    },
    {
      label: "Intelligence",
      items: [
        {
          title: "AI Insights",
          icon: Sparkles,
          defaultOpen: true,
          items: [
            { title: "Sales Trends", url: "#" },
            { title: "Stock Recommendation", url: "#" },
            { title: "Alerts", url: "#" },
            { title: "AI Summary Report", url: "#" }
          ]
        }
      ]
    },
    {
      label: "System",
      items: [
        {
          title: "Settings",
          icon: IconUsers,
          defaultOpen: true,
          items: [
            { title: "Users", url: "#" },
            { title: "Branch", url: "#" }
          ]
        }
      ]
    }
  ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1!">
              <Link href="/dashboard" className="flex items-center gap-3">
                <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg">
                  <IconInnerShadowTop className="size-5" />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-base font-semibold">{data.brand.name}</span>
                  <span className="text-muted-foreground text-xs">{data.brand.description}</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.primary.map((item) => (
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
        {data.sections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
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
                          {item.items.map((subItem) => (
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
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
