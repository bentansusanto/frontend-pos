import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const productService = createApi({
  reducerPath: "productService",
  baseQuery,
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    // get all products
    getProducts: builder.query<any, { branch_id?: string } | void>({
      query: (params) => ({
        url: "/products/find-all",
        method: "GET",
        params: params || {}
      }),
      transformResponse: (response: any) => response.data || response.datas || [],
      providesTags: ["Products"]
    }),
    // get product by id
    getProductById: builder.query<any, string | { id: string; branch_id?: string }>({
      query: (arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        const params = typeof arg !== "string" && arg.branch_id ? { branch_id: arg.branch_id } : {};
        return {
          url: `/products/${id}`,
          method: "GET",
          params
        };
      },
      transformResponse: (response: any) => response.data || response.datas || response,
      providesTags: ["Products"]
    }),
    // create product
    createProduct: builder.mutation<any, any>({
      query: (body) => ({
        url: "/products/create",
        method: "POST",
        body
      }),
      invalidatesTags: ["Products"]
    }),
    // update product
    updateProduct: builder.mutation<any, any>({
      query: ({ id, body }) => ({
        url: `/products/update/${id}`,
        method: "PUT",
        body
      }),
      invalidatesTags: ["Products"]
    }),
    // delete product
    deleteProduct: builder.mutation<any, string>({
      query: (id) => ({
        url: `/products/delete/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Products"]
    }),

    // variant products

    // create variant product
    createVariantProduct: builder.mutation<any, any>({
      query: (body) => ({
        url: "/variants/create",
        method: "POST",
        body
      }),
      invalidatesTags: ["Products"]
    }),
    // update variant product
    updateVariantProduct: builder.mutation<any, any>({
      query: ({ id, body }) => ({
        url: `/variants/update/${id}`,
        method: "POST",
        body
      }),
      invalidatesTags: ["Products"]
    }),
    // delete variant product
    deleteVariantProduct: builder.mutation<any, any>({
      query: ({ id }) => ({
        url: `/variants/delete/${id}`,
        method: "POST"
      }),
      invalidatesTags: ["Products"]
    }),
    // get variant product by id
    getVariantProductById: builder.query<any, string>({
      query: (id) => ({
        url: `/variants/get/${id}`,
        method: "GET"
      }),
      providesTags: ["Products"]
    }),
    // get all variant products
    getVariantProducts: builder.query<any, { branch_id?: string } | void>({
      query: (params) => ({
        url: "/variants/find-all",
        method: "GET",
        params: params || {}
      }),
      transformResponse: (response: any) => response.data || response.datas || [],
      providesTags: ["Products"]
    })
  })
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateVariantProductMutation,
  useUpdateVariantProductMutation,
  useDeleteVariantProductMutation,
  useGetVariantProductByIdQuery,
  useGetVariantProductsQuery
} = productService;
