import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const customerService = createApi({
  reducerPath: "customerService",
  baseQuery,
  tagTypes: ["Customers"],
  endpoints: (builder) => ({
    // get all customers
    getAllCustomers: builder.query<any, void>({
      query: () => ({
        url: "/customers/find-all",
        method: "GET"
      }),
      transformResponse: (response: any) => response.data || response.datas || [],
      providesTags: ["Customers"]
    }),
    // get customer by id
    getCustomerById: builder.query<any, string>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: "GET"
      }),
      transformResponse: (response: any) => response.data || response.datas || response,
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
