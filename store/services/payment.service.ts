import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const paymentService = createApi({
  reducerPath: "paymentService",
  baseQuery,
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
      transformResponse: (response: any) => response.data || response.datas || [],
      providesTags: ["Payments"]
    })
  })
});

export const { useCreatePaymentMutation, useVerifyPaymentMutation, useGetPaymentsQuery } =
  paymentService;
