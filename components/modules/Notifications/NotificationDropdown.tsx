"use client";

import React, { useEffect, useState } from "react";
import { 
  Bell, 
  AlertTriangle, 
  Settings2, 
  Info, 
  CheckCheck,
  Circle,
  Clock
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  useGetNotificationsQuery, 
  useGetUnreadCountQuery, 
  useMarkAsReadMutation, 
  useMarkAllAsReadMutation,
  Notification,
  NotificationType
} from "@/store/services/notification.service";
import { formatDistanceToNow } from "date-fns";
import { io } from "socket.io-client";
import { getCookie } from "@/utils/cookies";
import { toast } from "sonner";
import Link from "next/link";

const EMPTY_ARRAY: Notification[] = [];

export function NotificationDropdown() {
  const { data: notifications = EMPTY_ARRAY } = useGetNotificationsQuery({ limit: 10 });
  const { data: unreadCount = 0, refetch: refetchUnreadCount } = useGetUnreadCountQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (notifications !== EMPTY_ARRAY) {
      setLocalNotifications(notifications);
    }
  }, [notifications]);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000", {
      auth: {
        token: getCookie("pos_token"),
      },
    });

    socket.on("notification_received", (newNotification: Notification) => {
      setLocalNotifications((prev) => [newNotification, ...prev].slice(0, 10));
      refetchUnreadCount();
      
      if (newNotification.type === NotificationType.ANOMALY) {
        toast.error(`Anomaly Detected: ${newNotification.title}`, {
          description: newNotification.message,
        });
      } else if (newNotification.type === NotificationType.SESSION) {
        toast.success(newNotification.title, {
          description: newNotification.message,
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [refetchUnreadCount]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Immediate local update for better UX
    setLocalNotifications((prev) => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    await markAsRead(id);
  };

  const handleMarkAllRead = async () => {
    // Immediate local update for better UX. Since the backend now deletes them, we clear the array.
    setLocalNotifications([]);
    await markAllAsRead();
    toast.success("All notifications cleared");
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.ANOMALY:
        return <AlertTriangle className="h-4 w-4 text-rose-500" />;
      case NotificationType.SESSION:
        return <Settings2 className="h-4 w-4 text-blue-500" />;
      case NotificationType.SYSTEM:
        return <Info className="h-4 w-4 text-amber-500" />;
      default:
        return <Info className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative group">
          <Bell className="size-4 group-hover:text-primary transition-colors" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-3.5 min-w-[14px] flex items-center justify-center rounded-full border-2 border-background p-0 text-[8px] font-black"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[340px] p-0 shadow-2xl border-none ring-1 ring-border overflow-hidden">
        <DropdownMenuLabel className="px-4 py-2.5 bg-background dark:bg-zinc-950 flex items-center justify-between border-b">
          <span className="text-base font-bold tracking-tight">Notifications</span>
          <Button 
            variant="ghost" 
            className="h-auto p-0 text-primary hover:bg-transparent font-bold text-xs"
            onClick={(e) => {
              e.preventDefault();
              handleMarkAllRead();
            }}
          >
            Clear all
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-[480px] overflow-auto scrollbar-none bg-background dark:bg-zinc-950">
          {localNotifications.length > 0 ? (
            localNotifications.map((n) => (
              <DropdownMenuItem 
                key={n.id} 
                className={cn(
                  "flex items-start gap-3 p-3.5 cursor-pointer outline-none border-b border-muted/30 last:border-0",
                  !n.is_read ? "bg-background dark:bg-zinc-950" : "opacity-60"
                )}
                onClick={(e) => !n.is_read && handleMarkAsRead(n.id, e as any)}
              >
                {/* Left: Avatar/Icon */}
                <div className={cn(
                  "shrink-0 flex h-9 w-9 items-center justify-center rounded-full transition-transform active:scale-95 shadow-sm",
                  n.type === NotificationType.ANOMALY ? "bg-rose-50 dark:bg-rose-950/30 ring-1 ring-rose-100 dark:ring-rose-900/40" : 
                  n.type === NotificationType.SESSION ? "bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-100 dark:ring-blue-900/40" : "bg-muted/30 dark:bg-muted/10 ring-1 ring-muted"
                )}>
                  {getIcon(n.type)}
                </div>

                {/* Center: Content */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-[13px] font-bold truncate leading-none tracking-tight">
                      {n.title}
                    </h4>
                    {!n.is_read && (
                      <div className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] shrink-0" />
                    )}
                  </div>
                  <p className="text-[11.5px] text-muted-foreground line-clamp-2 leading-snug pr-2 dark:text-zinc-400">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 pt-0.5 dark:text-zinc-500">
                    <Clock className="h-2.5 w-2.5" />
                    <span className="font-semibold uppercase tracking-tighter">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-muted-foreground/20" />
              </div>
              <p className="text-sm font-semibold">Everything Caught Up!</p>
              <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">
                You don't have any new notifications at the moment.
              </p>
            </div>
          )}
        </div>
        {localNotifications.some(n => !n.is_read) && (
          <>
            <DropdownMenuSeparator className="m-0" />
            <div className="p-2 bg-muted/10 dark:bg-muted/5 text-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-[11px] h-8 gap-2 font-bold opacity-60 hover:opacity-100 transition-opacity dark:text-zinc-400"
                onClick={handleMarkAllRead}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Clear all indicators
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
