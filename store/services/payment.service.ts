import { getCookie } from "@/utils/cookies";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const paymentService = createApi({
  reducerPath: "paymentService",
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
  tagTypes: ["Payments"],
  endpoints: (builder) => ({
    // create payment
    createPayment: builder.mutation<any, any>({
      query: (data) => ({
        url: "/payments/create",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Payments"]
    }),
    // verify payment
    verifyPayment: builder.mutation<any, string>({
      query: (paymentId) => ({
        url: `/payments/verify-payment/${paymentId}`,
        method: "PUT"
      }),
      invalidatesTags: ["Payments"]
    }),
    // get all payments
    getPayments: builder.query<any, { branch_id?: string } | void>({
      query: (params) => ({
        url: "/payments/find-all",
        method: "GET",
        params: params || {}
      }),
      providesTags: ["Payments"]
    })
  })
});

export const { useCreatePaymentMutation, useVerifyPaymentMutation, useGetPaymentsQuery } =
  paymentService;
