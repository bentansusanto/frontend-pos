import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const userService = createApi({
  reducerPath: "userService",
  baseQuery,
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    // get all users
    getAllUsers: builder.query<any, void>({
      query: () => ({
        url: "/users",
        method: "GET"
      }),
      transformResponse: (response: any) => response.data || response.datas || [],
      providesTags: ["Users"]
    }),
    // get user by id
    getUserById: builder.query<any, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "GET"
      }),
      transformResponse: (response: any) => response.data || response.datas || response,
      providesTags: ["Users"]
    }),
    // create user
    createUser: builder.mutation<any, any>({
      query: (data) => ({
        url: "/users",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Users"]
    }),
    // update users
    updateUser: builder.mutation<any, any>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["Users"]
    }),
    // delete user
    deleteUser: builder.mutation<any, any>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Users"]
    }),

    // find all roles
    getAllRoles: builder.query<any, void>({
      query: () => ({
        url: "/roles",
        method: "GET"
      }),
      transformResponse: (response: any) => response.data || response.datas || []
    })
  })
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetAllRolesQuery
} = userService;
