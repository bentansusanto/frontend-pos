import { CreateProductStockRequest, ProductStockResponse } from "@/types/product-stock.type";
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const productStockService = createApi({
  reducerPath: "productStockService",
  baseQuery,
  tagTypes: ["ProductStocks"],
  endpoints: (builder) => ({
    // create product stock
    createProductStock: builder.mutation<ProductStockResponse, CreateProductStockRequest>({
      query: (body) => ({
        url: "/product-stocks/create",
        method: "POST",
        body
      }),
      invalidatesTags: ["ProductStocks"]
    }),
    // find all product stocks
    getProductStocks: builder.query<any, { branch_id?: string } | void>({
      query: (params) => ({
        url: "/product-stocks/find-all",
        method: "GET",
        params: params || {}
      }),
      transformResponse: (response: any) => response.data || response.datas || [],
      providesTags: ["ProductStocks"]
    })
  })
});

export const { useCreateProductStockMutation, useGetProductStocksQuery } = productStockService;
