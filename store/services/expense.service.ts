import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const expenseApi = createApi({
  reducerPath: "expenseApi",
  baseQuery,
  tagTypes: ["Expenses", "ExpenseCategories"],
  endpoints: (builder) => ({
    // Expenses
    getExpenses: builder.query<any, void>({
      query: () => "/expenses/find-all",
      providesTags: ["Expenses"],
    }),
    getExpenseById: builder.query<any, string>({
      query: (id) => `/expenses/find-one/${id}`,
      providesTags: (result, error, id) => [{ type: "Expenses", id }],
    }),
    createExpense: builder.mutation<any, any>({
      query: (body) => ({
        url: "/expenses/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Expenses"],
    }),
    updateExpense: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/expenses/update/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => ["Expenses", { type: "Expenses", id }],
    }),
    deleteExpense: builder.mutation<any, string>({
      query: (id) => ({
        url: `/expenses/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Expenses"],
    }),

    // Expense Categories
    getExpenseCategories: builder.query<any, void>({
      query: () => "/expense-categories/find-all",
      providesTags: ["ExpenseCategories"],
    }),
    getExpenseCategoryById: builder.query<any, string>({
      query: (id) => `/expense-categories/find-one/${id}`,
      providesTags: (result, error, id) => [{ type: "ExpenseCategories", id }],
    }),
    createExpenseCategory: builder.mutation<any, any>({
      query: (body) => ({
        url: "/expense-categories/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ExpenseCategories"],
    }),
    updateExpenseCategory: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/expense-categories/update/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => ["ExpenseCategories", { type: "ExpenseCategories", id }],
    }),
    deleteExpenseCategory: builder.mutation<any, string>({
      query: (id) => ({
        url: `/expense-categories/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ExpenseCategories"],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useGetExpenseByIdQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetExpenseCategoriesQuery,
  useGetExpenseCategoryByIdQuery,
  useCreateExpenseCategoryMutation,
  useUpdateExpenseCategoryMutation,
  useDeleteExpenseCategoryMutation,
} = expenseApi;
