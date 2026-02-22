import { CreateProductStockRequest, ProductStockResponse } from "@/types/product-stock.type";
import { getCookie } from "@/utils/cookies";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productStockService = createApi({
  reducerPath: "productStockService",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers) => {
      const token = getCookie("pos_token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
    credentials: "include"
  }),
  tagTypes: ["ProductStocks"],
  endpoints: (builder) => ({
    // create product stock
    createProductStock: builder.mutation<ProductStockResponse, CreateProductStockRequest>({
      query: (body) => ({
        url: "/product-stocks/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ProductStocks"],
    }),
    // find all product stocks
    getProductStocks: builder.query<any, { branch_id?: string } | void>({
      query: (params) => ({
        url: "/product-stocks/find-all",
        method: "GET",
        params: params || {}
      }),
      providesTags: ["ProductStocks"]
    }),
  })
});

export const { useCreateProductStockMutation, useGetProductStocksQuery } = productStockService;
