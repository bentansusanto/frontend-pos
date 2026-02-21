import { getCookie } from "@/utils/cookies";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const customerService = createApi({
  reducerPath: "customerService",
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
    // get all customers
    getAllCustomers: builder.query<any, void>({
      query: () => ({
        url: "/customers/find-all",
        method: "GET"
      }),
      providesTags: ["Customers"]
    }),
    // get customer by id
    getCustomerById: builder.query<any, string>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: "GET"
      }),
      providesTags: ["Customers"]
    }),
    // create customer
    createCustomer: builder.mutation<any, any>({
      query: (data) => ({
        url: "/customers/create",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Customers"]
    }),
    // update customer
    updateCustomer: builder.mutation<any, any>({
      query: ({ id, data }) => ({
        url: `/customers/${id}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["Customers"]
    }),
    // delete customer
    deleteCustomer: builder.mutation<any, any>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Customers"]
    })
  })
});

export const {
  useGetAllCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation
} = customerService;
