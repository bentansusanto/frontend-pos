import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const categoryService = createApi({
  reducerPath: "categoryService",
  baseQuery,
  tagTypes: ["Categories"],
  endpoints: (builder) => ({
    getAllCategories: builder.query<any, void>({
      query: () => ({
        url: "/categories",
        method: "GET"
      }),
      transformResponse: (response: any) => response.data || response.datas || [],
      providesTags: ["Categories"]
    }),
    createCategory: builder.mutation<any, { name: string }>({
      query: (body) => ({
        url: "/categories",
        method: "POST",
        body
      }),
      invalidatesTags: ["Categories"]
    })
  })
});

export const { useGetAllCategoriesQuery, useCreateCategoryMutation } = categoryService;
