import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const accountingApi = createApi({
  reducerPath: "accountingApi",
  baseQuery,
  tagTypes: ["Accounts", "FinancialReports"],
  endpoints: (builder) => ({
    // Accounts CRUD
    createAccount: builder.mutation<any, any>({
      query: (body: any) => ({
        url: "/accounting/create",
        method: "POST",
        body
      }),
      invalidatesTags: ["Accounts"]
    }),
    getAllAccounts: builder.query<any, void>({
      query: () => "/accounting/accounts",
      providesTags: ["Accounts"]
    }),
    getAccountById: builder.query<any, string>({
      query: (id: string) => `/accounting/${id}`,
      providesTags: ["Accounts"] // Or more granular like { type: 'Accounts', id }
    }),
    updateAccount: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }: { id: string; body: any }) => ({
        url: `/accounting/update/${id}`,
        method: "PUT",
        body
      }),
      invalidatesTags: ["Accounts"]
    }),
    deleteAccount: builder.mutation<any, string>({
      query: (id: string) => ({
        url: `/accounting/accounts/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Accounts"]
    }),

    // Journal Entries
    createJournalEntry: builder.mutation<any, any>({
      query: (body: any) => ({
        url: "/accounting/journals/create",
        method: "POST",
        body
      }),
      invalidatesTags: ["Accounts", "FinancialReports"]
    }),
    getAllJournalEntries: builder.query<any, void>({
      query: () => "/accounting/journals",
      providesTags: ["FinancialReports"]
    }),

    // Reports
    getBalanceSheet: builder.query<any, { branchId?: string; endDate?: string } | void>({
      query: (params: any) => ({
        url: "/accounting/reports/balance-sheet",
        params: params || {}
      }),
      providesTags: ["FinancialReports"]
    }),
    getIncomeStatement: builder.query<
      any,
      { branchId?: string; startDate?: string; endDate?: string } | void
    >({
      query: (params: any) => ({
        url: "/accounting/reports/income-statement",
        params: params || {}
      }),
      providesTags: ["FinancialReports"]
    }),
    getCashflow: builder.query<
      any,
      { branchId?: string; startDate?: string; endDate?: string } | void
    >({
      query: (params: any) => ({
        url: "/accounting/reports/cashflow",
        params: params || {}
      }),
      providesTags: ["FinancialReports"]
    })
  })
});

export const {
  useCreateAccountMutation,
  useGetAllAccountsQuery,
  useGetAccountByIdQuery,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
  useCreateJournalEntryMutation,
  useGetAllJournalEntriesQuery,
  useGetBalanceSheetQuery,
  useGetIncomeStatementQuery,
  useGetCashflowQuery
} = accountingApi;
