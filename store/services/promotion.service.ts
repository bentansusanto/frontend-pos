import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const promotionService = createApi({
  reducerPath: "promotionService",
  baseQuery,
  tagTypes: ["Promotions"],
  endpoints: (builder) => ({
    getPromotions: builder.query<any, { status?: string; branch_id?: string } | void>({
      query: (params) => ({
        url: "/promotions/find-all",
        method: "GET",
        params: params || undefined
      }),
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (response?.datas && Array.isArray(response.datas)) return response.datas;
        if (response?.data) {
          if (Array.isArray(response.data)) return response.data;
          if (response.data.datas && Array.isArray(response.data.datas)) return response.data.datas;
        }
        return [];
      },
      providesTags: ["Promotions"]
    }),
    getPromotionById: builder.query<any, string>({
      query: (id) => ({
        url: `/promotions/${id}`,
        method: "GET"
      }),
      transformResponse: (response: any) => {
        if (response?.data?.data) return response.data.data;
        if (response?.data) return response.data;
        return response;
      },
      providesTags: ["Promotions"]
    }),
    createPromotion: builder.mutation<any, any>({
      query: (body) => ({
        url: "/promotions/create",
        method: "POST",
        body
      }),
      invalidatesTags: ["Promotions"]
    }),
    updatePromotion: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/promotions/update/${id}`,
        method: "PATCH",
        body
      }),
      invalidatesTags: ["Promotions"]
    }),
    deletePromotion: builder.mutation<any, string>({
      query: (id) => ({
        url: `/promotions/delete/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Promotions"]
    })
  })
});

export const {
  useGetPromotionsQuery,
  useGetPromotionByIdQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation
} = promotionService;
