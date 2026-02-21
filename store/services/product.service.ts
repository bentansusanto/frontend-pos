import { getCookie } from "@/utils/cookies";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productService = createApi({
  reducerPath: "productService",
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
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    // get all products
    getProducts: builder.query<any, { branch_id?: string } | void>({
      query: (params) => ({
        url: "/products/find-all",
        method: "GET",
        params: params || {}
      }),
      providesTags: ["Products"]
    }),
    // get product by id
    getProductById: builder.query<any, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "GET"
      }),
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
    getVariantProducts: builder.query<any, void>({
      query: () => ({
        url: "/variants/find-all",
        method: "GET"
      }),
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
