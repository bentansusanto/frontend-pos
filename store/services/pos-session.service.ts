import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const posSessionApi = createApi({
  reducerPath: "posSessionApi",
  baseQuery,
  tagTypes: ["PosSession", "ActiveSession"],
  endpoints: (builder) => ({
    getPosSessions: builder.query<any, void>({
      query: () => "/pos-sessions",
      providesTags: ["PosSession"],
      transformResponse: (res: any) => (res && res.data !== undefined ? res.data : res),
    }),
    getActiveSession: builder.query<any, void>({
      query: () => "/pos-sessions/active",
      // Use a separate tag so it doesn't get polluted by other session mutations
      providesTags: ["ActiveSession"],
      // Never keep stale cache: always re-fetch from server on mount
      keepUnusedDataFor: 0,
      transformResponse: (res: any) => (res && res.data !== undefined ? res.data : res),
    }),
    openSession: builder.mutation<any, { branch_id: string; openingBalance: number; notes?: string }>({
      query: (body) => ({
        url: "/pos-sessions",
        method: "POST",
        body,
      }),
      // Invalidate both tags to trigger a fresh fetch of active session
      invalidatesTags: ["PosSession", "ActiveSession"],
    }),
    closeSession: builder.mutation<any, { 
      id: string; 
      paymentDeclarations?: { method: string; declaredAmount: number }[]; 
      notes?: string;
      reasonCategoryId?: string;
    }>({
      query: ({ id, ...body }) => ({
        url: `/pos-sessions/${id}/close`,
        method: "PATCH",
        body,
      }),
      // Invalidate both tags to trigger a fresh fetch of active session
      invalidatesTags: ["PosSession", "ActiveSession"],
    }),
    getSessionSummary: builder.query<any, string>({
      query: (id) => `/pos-sessions/${id}/summary`,
      providesTags: ["PosSession"],
      transformResponse: (res: any) => (res && res.data !== undefined ? res.data : res),
    }),
  }),
});

export const {
  useGetPosSessionsQuery,
  useGetActiveSessionQuery,
  useOpenSessionMutation,
  useCloseSessionMutation,
  useGetSessionSummaryQuery,
} = posSessionApi;
