import { getCookie } from "@/utils/cookies";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const stockMovementsService = createApi({
  reducerPath: "stockMovementsService",
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
    getStockMovements: builder.query<any, void>({
      query: () => ({
        url: "/stock-movements",
        method: "GET"
      }),
      providesTags: ["StockMovements"]
    })
  })
});

export const { useGetStockMovementsQuery } = stockMovementsService;
