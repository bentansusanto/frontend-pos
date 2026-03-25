import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import { posSessionApi } from "./pos-session.service";

export const paymentService = createApi({
  reducerPath: "paymentService",
  baseQuery,
  tagTypes: ["Payments", "PosSession"],
  endpoints: (builder) => ({
    // create payment
    createPayment: builder.mutation<any, any>({
      query: (data) => ({
        url: "/payments",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Payments"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(posSessionApi.util.invalidateTags(["PosSession"]));
        } catch {}
      }
    }),
    // verify payment
    verifyPayment: builder.mutation<any, string>({
      query: (paymentId) => ({
        url: `/payments/${paymentId}/verify`,
        method: "PUT"
      }),
      invalidatesTags: ["Payments"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(posSessionApi.util.invalidateTags(["PosSession"]));
        } catch {}
      }
    }),
    // get all payments
    getPayments: builder.query<any, { branch_id?: string } | void>({
      query: (params) => ({
        url: "/payments",
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
