import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const productBatchService = createApi({
  reducerPath: "productBatchService",
  baseQuery,
  tagTypes: ["ProductBatches"],
  endpoints: (builder) => ({
    getProductBatches: builder.query<any, { branch_id?: string; variant_id?: string } | void>({
      query: (params) => ({
        url: "/product-batches",
        method: "GET",
        params: params || {}
      }),
      transformResponse: (response: any) => response.data || response.datas || response || [],
      providesTags: ["ProductBatches"]
    }),
    getProductBatchById: builder.query<any, string>({
      query: (id) => ({
        url: `/product-batches/${id}`,
        method: "GET"
      }),
      transformResponse: (response: any) => response.data || response.datas || response,
      providesTags: ["ProductBatches"]
    }),
    createProductBatch: builder.mutation<any, any>({
      query: (body) => ({
        url: "/product-batches",
        method: "POST",
        body
      }),
      invalidatesTags: ["ProductBatches"]
    }),
    updateProductBatch: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/product-batches/${id}`,
        method: "PATCH",
        body
      }),
      invalidatesTags: ["ProductBatches"]
    }),
    deleteProductBatch: builder.mutation<any, string>({
      query: (id) => ({
        url: `/product-batches/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["ProductBatches"]
    })
  })
});

export const {
  useGetProductBatchesQuery,
  useGetProductBatchByIdQuery,
  useCreateProductBatchMutation,
  useUpdateProductBatchMutation,
  useDeleteProductBatchMutation
} = productBatchService;
