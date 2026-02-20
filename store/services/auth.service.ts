import { getCookie } from "@/utils/cookies";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseAuth = createApi({
  reducerPath: "baseAuth",
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
  endpoints: (builder) => ({
    // register
    register: builder.mutation<any, any>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data
      })
    }),
    // verify account
    verifyAccount: builder.mutation<any, any>({
      query: (token) => ({
        url: `/auth/verify-account?verify_token=${token}`,
        method: "POST"
      })
    }),

    // resend verify account
    resendVerifyAccount: builder.mutation<any, any>({
      query: (data) => ({
        url: "/auth/resend-verify-account",
        method: "POST",
        body: data
      })
    }),

    // login
    login: builder.mutation<any, any>({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        body: data
      })
    }),

    // logout
    logout: builder.mutation<any, any>({
      query: () => ({
        url: "/auth/logout",
        method: "POST"
      })
    }),

    // get profile
    getProfile: builder.query<any, void>({
      query: () => ({
        url: "/users/me",
        method: "GET"
      })
    }),

    // refreh token
    refreshToken: builder.mutation<any, void>({
      query: () => ({
        url: "/auth/refresh-token",
        method: "POST"
      })
    }),

    // forgot password
    forgotPassword: builder.mutation<any, any>({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data
      })
    }),

    // reset password
    resetPassword: builder.mutation<any, any>({
      query: (data) => ({
        url: `/auth/reset-password`,
        method: "POST",
        body: data
      })
    })
  })
});

export const {
  useRegisterMutation,
  useVerifyAccountMutation,
  useResendVerifyAccountMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation
} = baseAuth;
