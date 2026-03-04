import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export type DiscountType = "percentage" | "fixed";

export interface Discount {
  id: string;
  name: string;
  description: string;
  type: DiscountType;
  value: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export const discountService = createApi({
  reducerPath: "discountService",
  baseQuery,
  tagTypes: ["Discounts"],
  endpoints: (builder) => ({
    // get all discounts
    getDiscounts: builder.query<Discount[], { branch_id?: string } | void>({
      query: (params) => ({
        url: "/discounts/find-all",
        method: "GET",
        params: params || {}
      }),
      transformResponse: (response: any) => response.data || response.datas || [],
      providesTags: ["Discounts"]
    }),
    // get active discounts only (for POS checkout)
    getActiveDiscounts: builder.query<Discount[], void>({
      query: () => ({
        url: "/discounts/find-all",
        method: "GET"
      }),
      transformResponse: (response: any) => {
        const list: Discount[] = response.data || response.datas || [];
        const now = new Date();
        return list.filter((d) => {
          if (!d.isActive) return false;
          if (d.startDate && new Date(d.startDate) > now) return false;
          if (d.endDate && new Date(d.endDate) < now) return false;
          return true;
        });
      },
      providesTags: ["Discounts"]
    }),
    // get discount by id
    getDiscountById: builder.query<Discount, string>({
      query: (id) => ({
        url: `/discounts/${id}`,
        method: "GET"
      }),
      transformResponse: (response: any) => response.data || response,
      providesTags: ["Discounts"]
    }),
    // create discount
    createDiscount: builder.mutation<any, Partial<Discount>>({
      query: (data) => ({
        url: "/discounts/create",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Discounts"]
    }),
    // update discount
    updateDiscount: builder.mutation<any, { id: string; data: Partial<Discount> }>({
      query: ({ id, data }) => ({
        url: `/discounts/update/${id}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["Discounts"]
    }),
    // delete discount
    deleteDiscount: builder.mutation<any, string>({
      query: (id) => ({
        url: `/discounts/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Discounts"]
    })
  })
});

export const {
  useGetDiscountsQuery,
  useGetActiveDiscountsQuery,
  useGetDiscountByIdQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation
} = discountService;
