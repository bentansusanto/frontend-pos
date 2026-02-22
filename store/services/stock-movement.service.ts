import { getCookie } from "@/utils/cookies";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const stockMovementService = createApi({
  reducerPath: "stockMovementService",
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
  tagTypes: ["StockMovements"],
  endpoints: (builder) => ({
    // find all stock movements
    findAll: builder.query<any, { branch_id?: string } | void>({
      query: (params) => ({
        url: "/stock-movements",
        method: "GET",
        params: params || {}
      }),
      providesTags: ["StockMovements"]
    })
  })
});

export const { useFindAllQuery } = stockMovementService;
