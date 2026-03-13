"use client";

import { useState } from "react";
import { IconDotsVertical, IconLogout } from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
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
import { useGetProfileQuery, useLogoutMutation } from "@/store/services/auth.service";
import { useGetActiveSessionQuery } from "@/store/services/pos-session.service";
import { resetAllApiStates } from "@/store";
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
  const { data: activeSession } = useGetActiveSessionQuery();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

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

  const performLogout = async () => {
    try {
      await logout({}).unwrap();
    } catch {
      // no-op — still clean up session below
    } finally {
      // Remove auth and branch cookies
      removeCookie("pos_token");
      removeCookie("pos_branch_id");

      // ── Clear ALL RTK Query caches so the next user starts fresh ──────────
      resetAllApiStates(dispatch);

      toast.success("Logged out successfully");
      router.push("/login");
    }
  };

  const handleLogout = async () => {
    // ── Check if there is an active POS session for cashiers ────────────────
    if (profileData?.role === "cashier" && activeSession) {
      setShowLogoutAlert(true);
      return;
    }
    
    await performLogout();
  };

  return (
    <>
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

      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Active Session Detected</AlertDialogTitle>
            <AlertDialogDescription>
              You still have an open POS session. Please close your session first to ensure all transactions are properly recorded. 
              <br /><br />
              Are you sure you want to log out anyway?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={performLogout}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Continue Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
