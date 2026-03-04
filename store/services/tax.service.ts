import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export interface Tax {
  id: string;
  name: string;
  rate: number;
  is_inclusive: boolean;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const taxService = createApi({
  reducerPath: "taxService",
  baseQuery,
  tagTypes: ["Taxes"],
  endpoints: (builder) => ({
    // get all taxes
    getTaxes: builder.query<Tax[], void>({
      query: () => ({
        url: "/taxes/find-all",
        method: "GET"
      }),
      transformResponse: (response: any) => response.data || response.datas || [],
      providesTags: ["Taxes"]
    }),
    // get active taxes (for branch default tax selector)
    getActiveTaxes: builder.query<Tax[], void>({
      query: () => ({
        url: "/taxes/find-all",
        method: "GET"
      }),
      transformResponse: (response: any) => {
        const list: Tax[] = response.data || response.datas || [];
        return list.filter((t) => t.is_active);
      },
      providesTags: ["Taxes"]
    }),
    // get tax by id
    getTaxById: builder.query<Tax, string>({
      query: (id) => ({
        url: `/taxes/${id}`,
        method: "GET"
      }),
      transformResponse: (response: any) => response.data || response,
      providesTags: ["Taxes"]
    }),
    // create tax
    createTax: builder.mutation<any, Partial<Tax>>({
      query: (data) => ({
        url: "/taxes/create",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Taxes"]
    }),
    // update tax
    updateTax: builder.mutation<any, { id: string; data: Partial<Tax> }>({
      query: ({ id, data }) => ({
        url: `/taxes/update/${id}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["Taxes"]
    }),
    // delete tax (soft-delete)
    deleteTax: builder.mutation<any, string>({
      query: (id) => ({
        url: `/taxes/delete/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Taxes"]
    })
  })
});

export const {
  useGetTaxesQuery,
  useGetActiveTaxesQuery,
  useGetTaxByIdQuery,
  useCreateTaxMutation,
  useUpdateTaxMutation,
  useDeleteTaxMutation
} = taxService;
