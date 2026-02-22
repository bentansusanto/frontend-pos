import { getCookie } from "@/utils/cookies";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const profileService = createApi({
  reducerPath: "profileService",
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
  tagTypes: ["Profiles"],
  endpoints: (builder) => ({
    // create profile
    createProfile: builder.mutation({
      query: (body) => ({
        url: "/profiles/create",
        method: "POST",
        body
      }),
      invalidatesTags: ["Profiles"]
    }),
    // update profile
    updateProfile: builder.mutation({
      query: ({ id, body }) => ({
        url: `/profiles/update/${id}`,
        method: "POST",
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
      providesTags: ["Profiles"]
    }),
    // find profile by user id
    findProfileByUserId: builder.query({
      query: (userId) => ({
        url: `/profiles/user/${userId}`,
        method: "GET"
      }),
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
