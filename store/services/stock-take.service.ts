import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const stockTakeApi = createApi({
  reducerPath: "stockTakeApi",
  baseQuery,
  tagTypes: ["StockTakes"],
  endpoints: (builder) => ({
    getStockTakes: builder.query<any, string | { branch_id?: string } | void>({
      query: (arg) => {
        const branch_id = typeof arg === "string" ? arg : arg?.branch_id;
        return {
          url: "/stock-takes",
          method: "GET",
          params: branch_id ? { branch_id } : {},
        };
      },
      transformResponse: (res: any) => res.data || res.datas || [],
      providesTags: ["StockTakes"],
    }),
    getStockTake: builder.query<any, string>({
      query: (id) => ({
        url: `/stock-takes/${id}`,
        method: "GET",
      }),
      transformResponse: (res: any) => res.data || res.datas || res,
      providesTags: ["StockTakes"],
    }),
    createStockTake: builder.mutation<any, { branch_id: string; notes?: string; isFrozen?: boolean }>({
      query: (body) => ({
        url: "/stock-takes",
        method: "POST",
        body,
      }),
      invalidatesTags: ["StockTakes"],
    }),
    submitStockTake: builder.mutation<any, { id: string; items: any[]; notes?: string }>({
      query: ({ id, ...body }) => ({
        url: `/stock-takes/${id}/submit`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["StockTakes"],
    }),
    approveStockTake: builder.mutation<any, string>({
      query: (id) => ({
        url: `/stock-takes/${id}/approve`,
        method: "POST",
      }),
      invalidatesTags: ["StockTakes"],
    }),
    rejectStockTake: builder.mutation<any, string>({
      query: (id) => ({
        url: `/stock-takes/${id}/reject`,
        method: "POST",
      }),
      invalidatesTags: ["StockTakes"],
    }),
    checkBranchFrozen: builder.query<{ isFrozen: boolean; session?: any }, string>({
      query: (branchId) => ({
        url: `/stock-takes/check-frozen/${branchId}`,
        method: "GET",
      }),
      transformResponse: (res: any) => res.data,
      providesTags: ["StockTakes"],
      keepUnusedDataFor: 0, // Don't cache stale data
    }),
  }),
});

export const {
  useGetStockTakesQuery,
  useGetStockTakeQuery,
  useCreateStockTakeMutation,
  useSubmitStockTakeMutation,
  useApproveStockTakeMutation,
  useRejectStockTakeMutation,
  useCheckBranchFrozenQuery,
} = stockTakeApi;
