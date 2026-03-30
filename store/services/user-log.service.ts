import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

// ── Enums — lowercase matches backend enum values ────────────────────────────
export type ActionType = "create" | "update" | "delete" | "approve" | "refund";

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
  | "user"
  | "tax"
  | "discount";

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

export interface PaginatedUserLogResponse {
  message: string;
  datas: UserLog[];
  total: number;
  page: number;
  limit: number;
}

export const userLogService = createApi({
  reducerPath: "userLogService",
  baseQuery,
  tagTypes: ["UserLogs"],
  endpoints: (builder) => ({
    getUserLogs: builder.query<PaginatedUserLogResponse, UserLogFilters | void>({
      query: (filters) => ({
        url: "/user-logs",
        method: "GET",
        params: filters || {}
      }),
      transformResponse: (response: any) =>
        ({
          message: response.message,
          datas: response.datas || response.data || [],
          total: response.total || 0,
          page: response.page || 1,
          limit: response.limit || 15
        }) as PaginatedUserLogResponse,
      providesTags: ["UserLogs"]
    }),
    getUserLogById: builder.query<UserLog, string>({
      query: (id) => ({
        url: `/user-logs/${id}`,
        method: "GET"
      }),
      transformResponse: (res: any) => (res && res.data !== undefined ? res.data : res),
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
