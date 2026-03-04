import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const orderService = createApi({
  reducerPath: "orderService",
  baseQuery,
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    // get all orders
    getOrders: builder.query<any, { branch_id?: string } | void>({
      query: (params) => ({
        url: "/orders/find-all",
        method: "GET",
        params: params || {}
      }),
      transformResponse: (response: any) => response.data || response.datas || [],
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
