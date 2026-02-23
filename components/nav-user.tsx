"use client";

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { useGetProfileQuery, useLogoutMutation } from "@/store/services/auth.service";
import { removeCookie } from "@/utils/cookies";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function NavUser({
  user: initialUser
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();

  // Fetch user profile
  const { data: profileData, isLoading: isProfileLoading } = useGetProfileQuery();

  // Use fetched data if available, otherwise fallback to initialUser
  const user = profileData?.data
    ? {
        name: profileData.data.name,
        email: profileData.data.email,
        avatar: profileData.data.avatar || initialUser.avatar // Fallback avatar if backend doesn't return one
      }
    : initialUser;

  const handleLogout = async () => {
    try {
      await logout({}).unwrap();
      removeCookie("pos_token");
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Force logout on error
      removeCookie("pos_token");
      router.push("/login");
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name ? user.name.substring(0, 2).toUpperCase() : "CN"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {isProfileLoading ? "Loading..." : user.name}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {isProfileLoading ? "..." : user.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name ? user.name.substring(0, 2).toUpperCase() : "CN"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconCreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconNotification />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator /> */}
            <DropdownMenuItem onClick={handleLogout} disabled={isLogoutLoading}>
              <IconLogout />
              {isLogoutLoading ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
