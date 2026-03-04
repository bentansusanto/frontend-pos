import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const aiInsightService = createApi({
  reducerPath: "aiInsightService",
  baseQuery,
  tagTypes: ["AiInsights"],
  endpoints: (builder) => ({
    // Get AI Insights
    getAiInsights: builder.query({
      query: (params) => ({
        url: "/ai-insight/find",
        params
      }),
      transformResponse: (response: any) =>
        response.data || response.datas || (Array.isArray(response) ? response : []),
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
