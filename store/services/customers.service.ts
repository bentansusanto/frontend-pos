import { getCookie } from "@/utils/cookies";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const customersService = createApi({
  reducerPath: "customersService",
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
  tagTypes: ["Customers"],
  endpoints: (builder) => ({
    getCustomers: builder.query<any, void>({
      query: () => ({
        url: "/customers/find-all",
        method: "GET"
      }),
      providesTags: ["Customers"]
    }),
    getCustomer: builder.query<any, string>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: "GET"
      }),
      providesTags: ["Customers"]
    }),
    createCustomer: builder.mutation<any, any>({
      query: (body) => ({
        url: "/customers/create",
        method: "POST",
        body
      }),
      invalidatesTags: ["Customers"]
    }),
    updateCustomer: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/customers/${id}`,
        method: "PUT",
        body
      }),
      invalidatesTags: ["Customers"]
    }),
    deleteCustomer: builder.mutation<any, string>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Customers"]
    })
  })
});

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation
} = customersService;
