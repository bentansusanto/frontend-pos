import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export interface PurchaseItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Purchase {
  id: string;
  status: string;
  supplier_id: string;
  branch: { id: string; name: string };
  total: number;
  paid_amount: number;
  change_amount: number;
  payment_method: string;
  note: string;
  createdAt: string;
  purchaseItems: PurchaseItem[];
}

export interface PurchaseReceivingItem {
  id: string;
  productVariant: {
    id: string;
    name_variant: string;
    product?: { id: string; name_product: string };
  };
  qty: number;
  cost: number;
}

export interface PurchaseReceiving {
  id: string;
  purchase: { id: string };
  supplier: { id: string; name: string };
  branch: { id: string; name: string };
  note: string;
  createdAt: string;
  items: PurchaseReceivingItem[];
}

export const purchasingApi = createApi({
  reducerPath: "purchasingApi",
  baseQuery,
  tagTypes: ["Purchase", "PurchaseReceiving", "Products", "ProductStock"],
  endpoints: (builder) => ({
    getPurchases: builder.query<Purchase[], void>({
      query: () => "/purchases",
      providesTags: ["Purchase"]
    }),
    createPurchase: builder.mutation<Purchase, Partial<Purchase>>({
      query: (body) => ({
        url: "/purchases",
        method: "POST",
        body
      }),
      invalidatesTags: ["Purchase", "Products", "ProductStock"]
    }),
    getPurchaseById: builder.query<Purchase, string>({
      query: (id) => `/purchases/${id}`,
      providesTags: ["Purchase"]
    }),
    updatePurchase: builder.mutation<Purchase, { id: string; body: Partial<Purchase> }>({
      query: ({ id, body }) => ({
        url: `/purchases/${id}`,
        method: "PATCH",
        body
      }),
      invalidatesTags: ["Purchase"]
    }),
    deletePurchase: builder.mutation<void, string>({
      query: (id) => ({
        url: `/purchases/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Purchase"]
    }),

    getPurchaseReceivings: builder.query<PurchaseReceiving[], void>({
      query: () => "/purchase-receivings",
      providesTags: ["PurchaseReceiving"]
    }),
    getPurchaseReceivingById: builder.query<PurchaseReceiving, string>({
      query: (id) => `/purchase-receivings/${id}`,
      providesTags: ["PurchaseReceiving"]
    }),
    createPurchaseReceiving: builder.mutation<PurchaseReceiving, Partial<PurchaseReceiving>>({
      query: (body) => ({
        url: "/purchase-receivings",
        method: "POST",
        body
      }),
      invalidatesTags: ["Purchase", "PurchaseReceiving", "Products", "ProductStock"]
    }),
    deletePurchaseReceiving: builder.mutation<void, string>({
      query: (id) => ({
        url: `/purchase-receivings/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["PurchaseReceiving"]
    })
  })
});

export const {
  useGetPurchasesQuery,
  useGetPurchaseByIdQuery,
  useCreatePurchaseMutation,
  useUpdatePurchaseMutation,
  useDeletePurchaseMutation,
  useGetPurchaseReceivingsQuery,
  useGetPurchaseReceivingByIdQuery,
  useCreatePurchaseReceivingMutation,
  useDeletePurchaseReceivingMutation
} = purchasingApi;
