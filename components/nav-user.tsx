"use client";

import { IconDotsVertical, IconLogout } from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
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
import { useAppDispatch } from "@/store/hooks";
import { baseAuth, useGetProfileQuery, useLogoutMutation } from "@/store/services/auth.service";
import { branchService } from "@/store/services/branch.service";
import { discountService } from "@/store/services/discount.service";
import { orderService } from "@/store/services/order.service";
import { productService } from "@/store/services/product.service";
import { profileService } from "@/store/services/profile.service";
import { supplierService } from "@/store/services/supplier.service";
import { taxService } from "@/store/services/tax.service";
import { userLogService } from "@/store/services/user-log.service";
import { userService } from "@/store/services/user.service";
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
  const dispatch = useAppDispatch();
  const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();

  // Fetch user profile
  const { data: profileData, isLoading: isProfileLoading } = useGetProfileQuery();

  // Use fetched data if available, otherwise fallback to initialUser
  const user = profileData
    ? {
        name: profileData.name,
        email: profileData.email,
        avatar: profileData.avatar || initialUser.avatar
      }
    : initialUser;

  const handleLogout = async () => {
    try {
      await logout({}).unwrap();
    } catch {
      // no-op — still clean up session below
    } finally {
      // Remove auth cookie
      removeCookie("pos_token");

      // ── Clear ALL RTK Query caches so the next user starts fresh ──────────
      dispatch(baseAuth.util.resetApiState());
      dispatch(profileService.util.resetApiState());
      dispatch(userService.util.resetApiState());
      dispatch(branchService.util.resetApiState());
      dispatch(orderService.util.resetApiState());
      dispatch(productService.util.resetApiState());
      dispatch(supplierService.util.resetApiState());
      dispatch(taxService.util.resetApiState());
      dispatch(discountService.util.resetApiState());
      dispatch(userLogService.util.resetApiState());

      toast.success("Logged out successfully");
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
