import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export enum NotificationType {
  ANOMALY = 'anomaly',
  SESSION = 'session',
  INFO = 'info',
  SYSTEM = 'system',
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: any;
  is_read: boolean;
  created_at: string;
}

export const notificationService = createApi({
  reducerPath: "notificationService",
  baseQuery,
  tagTypes: ["Notifications"],
  endpoints: (builder) => ({
    getNotifications: builder.query<Notification[], { limit?: number } | void>({
      query: (params) => ({
        url: "/notifications",
        method: "GET",
        params: params || { limit: 10 }
      }),
      providesTags: ["Notifications"]
    }),
    getUnreadCount: builder.query<number, void>({
      query: () => "/notifications/unread-count",
      transformResponse: (response: any) => response.count ?? response,
      providesTags: ["Notifications"]
    }),
    markAsRead: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH"
      }),
      invalidatesTags: ["Notifications"]
    }),
    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "POST"
      }),
      invalidatesTags: ["Notifications"]
    }),
  })
});

export const { 
  useGetNotificationsQuery, 
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation
} = notificationService;
