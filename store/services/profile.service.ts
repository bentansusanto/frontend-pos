import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const profileService = createApi({
  reducerPath: "profileService",
  baseQuery,
  tagTypes: ["Profiles"],
  endpoints: (builder) => ({
    // create profile
    createProfile: builder.mutation({
      query: (body) => ({
        url: "/profiles",
        method: "POST",
        body
      }),
      invalidatesTags: ["Profiles"]
    }),
    // update profile
    updateProfile: builder.mutation({
      query: ({ id, body }) => ({
        url: `/profiles/${id}`,
        method: "PUT",
        body
      }),
      invalidatesTags: ["Profiles"]
    }),
    // find profile
    findProfile: builder.query({
      query: () => ({
        url: "/profiles/me",
        method: "GET"
      }),
      transformResponse: (response: any) => response.data || response.datas || response,
      providesTags: ["Profiles"]
    }),
    // find profile by user id
    findProfileByUserId: builder.query({
      query: (userId) => ({
        url: `/profiles/user/${userId}`,
        method: "GET"
      }),
      transformResponse: (response: any) => response.data || response.datas || response,
      providesTags: ["Profiles"]
    })
    // find
  })
});

export const {
  useCreateProfileMutation,
  useUpdateProfileMutation,
  useFindProfileQuery,
  useFindProfileByUserIdQuery,
  useLazyFindProfileByUserIdQuery
} = profileService;
