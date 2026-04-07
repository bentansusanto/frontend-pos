import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const loyaltySettingsApi = createApi({
  reducerPath: "loyaltySettingsApi",
  baseQuery,
  tagTypes: ["LoyaltySettings"],
  endpoints: (builder) => ({
    getLoyaltySettings: builder.query<any[], void>({
      query: () => "/loyalty-settings",
      providesTags: ["LoyaltySettings"],
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (response?.data) return response.data;
        return response || [];
      },
    }),
    getCurrentLoyaltySettings: builder.query<any, { branchId?: string }>({
      query: (params) => ({
        url: "/loyalty-settings/current",
        method: "GET",
        params,
      }),
      providesTags: ["LoyaltySettings"],
      transformResponse: (response: any) => {
        if (response?.data) return response.data;
        return response;
      },
    }),
    createLoyaltySetting: builder.mutation<any, any>({
      query: (body) => ({
        url: "/loyalty-settings",
        method: "POST",
        body,
      }),
      invalidatesTags: ["LoyaltySettings"],
    }),
    updateLoyaltySetting: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/loyalty-settings/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["LoyaltySettings"],
    }),
    deleteLoyaltySetting: builder.mutation<any, string>({
      query: (id) => ({
        url: `/loyalty-settings/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LoyaltySettings"],
    }),
  }),
});

export const {
  useGetLoyaltySettingsQuery,
  useGetCurrentLoyaltySettingsQuery,
  useCreateLoyaltySettingMutation,
  useUpdateLoyaltySettingMutation,
  useDeleteLoyaltySettingMutation,
} = loyaltySettingsApi;
