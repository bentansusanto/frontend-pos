import { getCookie } from "@/utils/cookies";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const categoryService = createApi({
  reducerPath: "categoryService",
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
  tagTypes: ["Categories"],
  endpoints: (builder) => ({
    getAllCategories: builder.query<any, void>({
      query: () => ({
        url: "/categories/find-all",
        method: "POST"
      }),
      providesTags: ["Categories"]
    }),
    createCategory: builder.mutation<any, { name: string }>({
      query: (body) => ({
        url: "/categories/create",
        method: "POST",
        body
      }),
      invalidatesTags: ["Categories"]
    })
  })
});

export const { useGetAllCategoriesQuery, useCreateCategoryMutation } = categoryService;
