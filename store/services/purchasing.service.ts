import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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
  branch: { id: string; name_branch: string };
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
  productVariant: { id: string; name_variant: string };
  qty: number;
  cost: number;
}

export interface PurchaseReceiving {
  id: string;
  purchase: { id: string };
  supplier: { id: string; name: string };
  branch: { id: string; name_branch: string };
  note: string;
  createdAt: string;
  items: PurchaseReceivingItem[];
}

export const purchasingApi = createApi({
  reducerPath: "purchasingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL + "/api/v1"
  }),
  tagTypes: ["Purchase", "PurchaseReceiving"],
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
    createPurchaseReceiving: builder.mutation<PurchaseReceiving, Partial<PurchaseReceiving>>({
      query: (body) => ({
        url: "/purchase-receivings",
        method: "POST",
        body
      }),
      invalidatesTags: ["PurchaseReceiving"] // This action also changes Inventory stocks! Use cautious fetching elsewhere if needed.
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
  useCreatePurchaseMutation,
  useDeletePurchaseMutation,
  useGetPurchaseReceivingsQuery,
  useCreatePurchaseReceivingMutation,
  useDeletePurchaseReceivingMutation
} = purchasingApi;
