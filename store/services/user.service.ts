import { getCookie } from "@/utils/cookies";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export const userService = createApi({
  reducerPath: "userService",
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
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    // get all users
    getAllUsers: builder.query<any, void>({
      query: () => ({
        url: "/users/find-all",
        method: "GET"
      }),
      providesTags: ["Users"]
    }),
    // get user by id
    getUserById: builder.query<any, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "GET"
      }),
      providesTags: ["Users"]
    }),
    // create user
    createUser: builder.mutation<any, any>({
      query: (data) => ({
        url: "/users/create",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Users"]
    }),
    // update users
    updateUser: builder.mutation<any, any>({
      query: ({id,data}) => ({
        url: `/users/update/${id}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["Users"]
    }),
    // delete user
    deleteUser: builder.mutation<any, any>({
      query: (id) => ({
        url: `/users/delete/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Users"]
    }),

    // find all roles
    getAllRoles: builder.query<any, void>({
      query: () => ({
        url: "/roles/find-all",
        method: "GET"
      })
    })
  })
});

export const { useGetAllUsersQuery, useGetUserByIdQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation, useGetAllRolesQuery } = userService;
