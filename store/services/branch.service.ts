import { getCookie } from "@/utils/cookies";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const branchService = createApi({
  reducerPath: "branchService",
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
  tagTypes: ["Branches"],
  endpoints: (builder) => ({
    // get all branches
    getBranches: builder.query<any, void>({
      query: () => ({
        url: "/branches/find-all",
        method: "GET"
      }),
      providesTags: ["Branches"]
    }),
    // get branch by id
    getBranchById: builder.query<any, string>({
      query: (id) => ({
        url: `/branches/${id}`,
        method: "GET"
      }),
      providesTags: ["Branches"]
    }),
    // create branch
    createBranch: builder.mutation<any, any>({
      query: (data) => ({
        url: "/branches/create",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Branches"]
    }),
    // update branch
    updateBranch: builder.mutation<any, any>({
      query: ({id,data}) => ({
        url: `/branches/update/${id}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["Branches"]
    }),
    // delete branch
    deleteBranch: builder.mutation<any, any>({
      query: (id) => ({
        url: `/branches/delete/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Branches"]
    }),
  })
});

export const { useGetBranchesQuery, useGetBranchByIdQuery, useCreateBranchMutation, useUpdateBranchMutation, useDeleteBranchMutation } = branchService;
