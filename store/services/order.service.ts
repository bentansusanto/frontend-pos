import { getCookie } from "@/utils/cookies";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const orderService = createApi({
  reducerPath: "orderService",
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
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    // get all orders
    getOrders: builder.query<any, { branch_id?: string } | void>({
      query: (params) => ({
        url: "/orders/find-all",
        method: "GET",
        params: params || {}
      }),
      providesTags: ["Orders"]
    }),
    // create order
    createOrder: builder.mutation({
      query: (body) => ({
        url: "/orders/create",
        method: "POST",
        body
      }),
      invalidatesTags: ["Orders"]
    }),
    // update order item quantity
    updateOrderQuantity: builder.mutation({
      query: ({ orderId, orderItemId, quantity }) => ({
        url: `/orders/${orderId}/items/${orderItemId}/quantity`,
        method: "PUT",
        body: { quantity }
      }),
      invalidatesTags: ["Orders"]
    }),
    // update order
    updateOrder: builder.mutation({
      query: ({ id, body }) => ({
        url: `/orders/${id}`,
        method: "PUT",
        body
      }),
      invalidatesTags: ["Orders"]
    }),
    // delete order item
    deleteOrderItem: builder.mutation({
      query: ({ orderId, orderItemId }) => ({
        url: `/orders/${orderId}/items/${orderItemId}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Orders"]
    })
  })
});

export const {
  useCreateOrderMutation,
  useGetOrdersQuery,
  useUpdateOrderMutation,
  useUpdateOrderQuantityMutation,
  useDeleteOrderItemMutation
} = orderService;
