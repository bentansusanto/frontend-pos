import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

const buildQuery = (params?: Record<string, string | undefined>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const salesReportService = createApi({
  reducerPath: "salesReportService",
  baseQuery,
  tagTypes: ["SalesReports"],
  endpoints: (builder) => ({
    getSalesSummary: builder.query<
      any,
      { startDate?: string; endDate?: string; branchId?: string } | void
    >({
      query: (params) => ({
        url: `/sales-reports/summary${buildQuery(params || {})}`,
        method: "GET"
      }),
      transformResponse: (response: any) => response,
      providesTags: ["SalesReports"]
    }),
    getSalesReport: builder.query<
      any,
      { startDate?: string; endDate?: string; branchId?: string; paymentMethod?: string } | void
    >({
      query: (params) => ({
        url: `/sales-reports${buildQuery(params || {})}`,
        method: "GET"
      }),
      transformResponse: (response: any) => response || [],
      providesTags: ["SalesReports"]
    }),
    getWeeklySalesReport: builder.query<any, { branchId?: string } | void>({
      query: (params) => ({
        url: `/sales-reports/weekly${buildQuery(params || {})}`,
        method: "GET"
      }),
      transformResponse: (response: any) => response || [],
      providesTags: ["SalesReports"]
    }),
    getMonthlySalesReport: builder.query<any, { branchId?: string } | void>({
      query: (params) => ({
        url: `/sales-reports/monthly${buildQuery(params || {})}`,
        method: "GET"
      }),
      transformResponse: (response: any) => response || [],
      providesTags: ["SalesReports"]
    }),
    getYearlySalesReport: builder.query<any, { branchId?: string } | void>({
      query: (params) => ({
        url: `/sales-reports/yearly${buildQuery(params || {})}`,
        method: "GET"
      }),
      transformResponse: (response: any) => response || [],
      providesTags: ["SalesReports"]
    })
  })
});

export const {
  useGetSalesSummaryQuery,
  useGetSalesReportQuery,
  useGetWeeklySalesReportQuery,
  useGetMonthlySalesReportQuery,
  useGetYearlySalesReportQuery
} = salesReportService;
