import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const stockMovementsService = createApi({
  reducerPath: "stockMovementsService",
  baseQuery,
  tagTypes: ["StockMovements"],
  endpoints: (builder) => ({
    getStockMovements: builder.query<any, void>({
      query: () => ({
        url: "/stock-movements",
        method: "GET"
      }),
      transformResponse: (response: any) => response.data || response.datas || [],
      providesTags: ["StockMovements"]
    })
  })
});

export const { useGetStockMovementsQuery } = stockMovementsService;
