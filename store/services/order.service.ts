import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import { posSessionApi } from "./pos-session.service";
import { salesReportService } from "./sales-report.service";

export const orderService = createApi({
  reducerPath: "orderService",
  baseQuery,
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    // get all orders
    getOrders: builder.query<any, { branch_id?: string; status?: string } | void>({
      query: (params) => ({
        url: "/orders",
        method: "GET",
        params: params || {}
      }),
      transformResponse: (response: any) => response.data || response.datas || [],
      providesTags: ["Orders"]
    }),
    // create order
    createOrder: builder.mutation({
      query: (body) => ({
        url: "/orders",
        method: "POST",
        body
      }),
      invalidatesTags: ["Orders"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(posSessionApi.util.invalidateTags(["PosSession"]));
        } catch {}
      }
    }),
    // update order item quantity
    updateOrderQuantity: builder.mutation({
      query: ({ orderId, orderItemId, quantity }) => ({
        url: `/orders/${orderId}/items/${orderItemId}/quantity`,
        method: "PUT",
        body: { quantity }
      }),
      invalidatesTags: ["Orders"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(posSessionApi.util.invalidateTags(["PosSession"]));
        } catch {}
      }
    }),
    // update order
    updateOrder: builder.mutation({
      query: ({ id, body }) => ({
        url: `/orders/${id}`,
        method: "PUT",
        body
      }),
      invalidatesTags: ["Orders"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(posSessionApi.util.invalidateTags(["PosSession"]));
        } catch {}
      }
    }),
    // delete order item
    deleteOrderItem: builder.mutation({
      query: ({ orderId, orderItemId }) => ({
        url: `/orders/${orderId}/items/${orderItemId}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Orders"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(posSessionApi.util.invalidateTags(["PosSession"]));
        } catch {}
      }
    }),
    // refund order
    refundOrder: builder.mutation({
      query: ({ id, reason, reason_category_id }) => ({
        url: `/orders/${id}/refund`,
        method: "POST",
        body: { reason, reason_category_id }
      }),
      invalidatesTags: ["Orders"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(posSessionApi.util.invalidateTags(["PosSession"]));
          dispatch(salesReportService.util.invalidateTags(["SalesReports"]));
        } catch {}
      }
    })
  })
});

export const {
  useCreateOrderMutation,
  useGetOrdersQuery,
  useUpdateOrderMutation,
  useUpdateOrderQuantityMutation,
  useDeleteOrderItemMutation,
  useRefundOrderMutation
} = orderService;
