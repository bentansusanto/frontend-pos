import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const branchService = createApi({
  reducerPath: "branchService",
  baseQuery,
  tagTypes: ["Branches"],
  endpoints: (builder) => ({
    // get all branches
    getBranches: builder.query<any, void>({
      query: () => ({
        url: "/branches/find-all",
        method: "GET"
      }),
      transformResponse: (response: any) => response.data || response.datas || [],
      providesTags: ["Branches"]
    }),
    // get branch by id
    getBranchById: builder.query<any, string>({
      query: (id) => ({
        url: `/branches/${id}`,
        method: "GET"
      }),
      transformResponse: (response: any) => response.data || response.datas || response,
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
      query: ({ id, data }) => ({
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
    })
  })
});

export const {
  useGetBranchesQuery,
  useGetBranchByIdQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation
} = branchService;
