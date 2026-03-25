import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  postalCode?: string;
  contactPerson?: string;
  notes?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const supplierService = createApi({
  reducerPath: "supplierService",
  baseQuery,
  tagTypes: ["Suppliers"],
  endpoints: (builder) => ({
    // get all suppliers
    getSuppliers: builder.query<Supplier[], void>({
      query: () => ({
        url: "/suppliers",
        method: "GET"
      }),
      transformResponse: (response: any) => response.data || response.datas || [],
      providesTags: ["Suppliers"]
    }),
    // get supplier by id
    getSupplierById: builder.query<Supplier, string>({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: "GET"
      }),
      transformResponse: (response: any) => response.data || response,
      providesTags: ["Suppliers"]
    }),
    // create supplier
    createSupplier: builder.mutation<any, Partial<Supplier>>({
      query: (data) => ({
        url: "/suppliers",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Suppliers"]
    }),
    // update supplier
    updateSupplier: builder.mutation<any, { id: string; data: Partial<Supplier> }>({
      query: ({ id, data }) => ({
        url: `/suppliers/${id}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["Suppliers"]
    }),
    // delete supplier (soft-delete)
    deleteSupplier: builder.mutation<any, string>({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Suppliers"]
    })
  })
});

export const {
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation
} = supplierService;
