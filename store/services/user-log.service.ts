import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

// ── Enums — lowercase matches backend enum values ────────────────────────────
export type ActionType = "create" | "update" | "delete" | "login" | "logout" | "approve" | "cancel";

export type EntityType =
  | "product"
  | "product_variant"
  | "sale"
  | "purchase"
  | "purchase_receiving"
  | "stock_movement"
  | "stock_adjustment"
  | "customer"
  | "supplier"
  | "expense"
  | "user";

// ── Shape returned from backend service (mapped/flat) ─────────────────────────
export interface UserLog {
  id: string;
  user_id: string;
  branch_id?: string;
  action: ActionType;
  module: EntityType; // backend calls this "module", maps from entity_type
  description: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserLogFilters {
  branchId?: string;
  userId?: string;
  entityType?: EntityType;
  action?: ActionType;
  limit?: number;
  page?: number;
}

export const userLogService = createApi({
  reducerPath: "userLogService",
  baseQuery,
  tagTypes: ["UserLogs"],
  endpoints: (builder) => ({
    getUserLogs: builder.query<UserLog[], UserLogFilters | void>({
      query: (filters) => ({
        url: "/user-logs",
        method: "GET",
        params: filters || {}
      }),
      transformResponse: (response: any) => response.datas || response.data || [],
      providesTags: ["UserLogs"]
    }),
    getUserLogById: builder.query<UserLog, string>({
      query: (id) => ({
        url: `/user-logs/${id}`,
        method: "GET"
      }),
      transformResponse: (response: any) => response.data || response,
      providesTags: ["UserLogs"]
    }),
    getUserLogsByUser: builder.query<UserLog[], { userId: string; limit?: number }>({
      query: ({ userId, limit }) => ({
        url: `/user-logs/user/${userId}`,
        method: "GET",
        params: limit ? { limit } : {}
      }),
      transformResponse: (response: any) => response.datas || response.data || [],
      providesTags: ["UserLogs"]
    })
  })
});

export const { useGetUserLogsQuery, useGetUserLogByIdQuery, useGetUserLogsByUserQuery } =
  userLogService;
