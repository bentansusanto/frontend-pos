import { getCookie } from "@/utils/cookies";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const aiInsightService = createApi({
  reducerPath: "aiInsightService",
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
  tagTypes: ["AiInsights"],
  endpoints: (builder) => ({
    // Get AI Insights
    getAiInsights: builder.query({
      query: (params) => ({
        url: "/ai-insight/find",
        params
      }),
      providesTags: ["AiInsights"]
    }),
    // Generate AI Insights
    generateAiInsights: builder.mutation({
      query: (body) => ({
        url: "/ai-insight/generate",
        method: "POST",
        body
      }),
      invalidatesTags: ["AiInsights"]
    })
  })
});

export const { useGetAiInsightsQuery, useGenerateAiInsightsMutation } = aiInsightService;
