import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export interface ReasonCategory {
  id: string;
  type: "refund" | "pos_session";
  label: string;
  value: string;
  min_description_length: number;
  is_anomaly_trigger: boolean;
  is_active: boolean;
}

export const reasonCategoryService = createApi({
  reducerPath: "reasonCategoryService",
  baseQuery,
  tagTypes: ["ReasonCategories"],
  endpoints: (builder) => ({
    getReasonCategories: builder.query<ReasonCategory[], { type?: string } | void>({
      query: (params) => ({
        url: "/reason-categories",
        method: "GET",
        params: params || {}
      }),
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        return response.data || response.datas || [];
      },
      providesTags: ["ReasonCategories"]
    }),
    getReasonCategoryById: builder.query<ReasonCategory, string>({
      query: (id) => `/reason-categories/${id}`,
      transformResponse: (response: any) => {
        if (!response.data && response.id) return response;
        return response.data;
      },
      providesTags: (result, error, id) => [{ type: "ReasonCategories", id }]
    }),
    createReasonCategory: builder.mutation<ReasonCategory, Partial<ReasonCategory>>({
      query: (body) => ({
        url: "/reason-categories",
        method: "POST",
        body
      }),
      invalidatesTags: ["ReasonCategories"]
    }),
    updateReasonCategory: builder.mutation<ReasonCategory, { id: string } & Partial<ReasonCategory>>({
      query: ({ id, ...body }) => ({
        url: `/reason-categories/${id}`,
        method: "PUT",
        body
      }),
      invalidatesTags: ["ReasonCategories"]
    }),
    deleteReasonCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/reason-categories/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["ReasonCategories"]
    })
  })
});

export const { 
  useGetReasonCategoriesQuery, 
  useGetReasonCategoryByIdQuery,
  useCreateReasonCategoryMutation,
  useUpdateReasonCategoryMutation,
  useDeleteReasonCategoryMutation
} = reasonCategoryService;
