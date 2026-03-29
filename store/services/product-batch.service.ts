import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const productBatchService = createApi({
  reducerPath: "productBatchService",
  baseQuery,
  tagTypes: ["ProductBatches"],
  endpoints: (builder) => ({
    // ─── READ ─────────────────────────────────────────────────────────────────

    /** Fetch all batches, optionally filtered by branch or variant */
    getProductBatches: builder.query<any, { branch_id?: string; variant_id?: string } | void>({
      query: (params) => ({ url: "/product-batches", method: "GET", params: params || {} }),
      transformResponse: (response: any) => response.data || response.datas || response || [],
      providesTags: ["ProductBatches"],
    }),

    /** Fetch a single batch by ID */
    getProductBatchById: builder.query<any, string>({
      query: (id) => ({ url: `/product-batches/${id}`, method: "GET" }),
      transformResponse: (response: any) => response.data || response.datas || response,
      providesTags: ["ProductBatches"],
    }),

    /**
     * Fetch the stock movement history for a specific batch.
     * Used by the Batch Movement History tab in the detail view.
     */
    getBatchMovements: builder.query<any[], string>({
      query: (batchId) => ({ url: `/product-batches/${batchId}/movements`, method: "GET" }),
      transformResponse: (response: any) => response.data || [],
      providesTags: ["ProductBatches"],
    }),

    // ─── WRITE ────────────────────────────────────────────────────────────────

    /** Create a new product batch */
    createProductBatch: builder.mutation<any, any>({
      query: (body) => ({ url: "/product-batches", method: "POST", body }),
      invalidatesTags: ["ProductBatches"],
    }),

    /** Update an existing batch (expiry, cost, status, etc.) */
    updateProductBatch: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/product-batches/${id}`, method: "PATCH", body }),
      invalidatesTags: ["ProductBatches"],
    }),

    /**
     * Dispose (write-off) a batch.
     * Sets status to EXPIRED, zeroes currentQuantity, records EXPIRED stock movement.
     */
    disposeProductBatch: builder.mutation<any, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/product-batches/${id}/dispose`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["ProductBatches"],
    }),

    /** Soft-delete a batch record */
    deleteProductBatch: builder.mutation<any, string>({
      query: (id) => ({ url: `/product-batches/${id}`, method: "DELETE" }),
      invalidatesTags: ["ProductBatches"],
    }),
  }),
});

export const {
  useGetProductBatchesQuery,
  useGetProductBatchByIdQuery,
  useGetBatchMovementsQuery,
  useCreateProductBatchMutation,
  useUpdateProductBatchMutation,
  useDisposeProductBatchMutation,
  useDeleteProductBatchMutation,
} = productBatchService;
