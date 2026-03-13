import {
  useGetBalanceSheetQuery,
  useGetIncomeStatementQuery,
  useGetCashflowQuery,
  useGetAllAccountsQuery,
  useCreateJournalEntryMutation,
  useGetAllJournalEntriesQuery
} from "@/store/services/accounting.service";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

export function useAccountingDashboard(branchId?: string) {
  const [dateRange, setDateRange] = useState<{ startDate?: Date; endDate?: Date }>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of month
    endDate: new Date() // Today
  });

  const queryParams = {
    branchId,
    startDate: dateRange.startDate ? format(dateRange.startDate, "yyyy-MM-dd") : undefined,
    endDate: dateRange.endDate ? format(dateRange.endDate, "yyyy-MM-dd") : undefined
  };

  const { data: balanceSheetData, isLoading: isLoadingBalance } = useGetBalanceSheetQuery({
    branchId,
    endDate: queryParams.endDate
  });
  
  const { data: incomeData, isLoading: isLoadingIncome } = useGetIncomeStatementQuery(queryParams);
  const { data: cashflowData, isLoading: isLoadingCashflow } = useGetCashflowQuery(queryParams);

  const isLoading = isLoadingBalance || isLoadingIncome || isLoadingCashflow;

  const summary = useMemo(() => {
    return {
      totalAssets: balanceSheetData?.data?.totalAssets || 0,
      totalLiabilities: balanceSheetData?.data?.totalLiabilities || 0,
      totalEquity: balanceSheetData?.data?.totalEquities || 0,
      netIncome: incomeData?.data?.netIncome || 0,
      totalRevenue: incomeData?.data?.totalRevenue || 0,
      totalExpense: incomeData?.data?.totalExpense || 0,
      netCashflow: cashflowData?.data?.netIncreaseInCash || 0,
      operatingCashflow: cashflowData?.data?.netOperating || 0
    };
  }, [balanceSheetData, incomeData, cashflowData]);

  return {
    summary,
    balanceSheet: balanceSheetData?.data,
    incomeStatement: incomeData?.data,
    cashflow: cashflowData?.data,
    isLoading,
    dateRange,
    setDateRange
  };
}

export function useAccountingAccounts() {
  const { data, isLoading, refetch } = useGetAllAccountsQuery();
  const accounts = data?.data || [];
  
  const assetAccounts = accounts.filter((a: any) => a.type === "ASSET");
  const liabilityAccounts = accounts.filter((a: any) => a.type === "LIABILITY");
  const equityAccounts = accounts.filter((a: any) => a.type === "EQUITY");
  const revenueAccounts = accounts.filter((a: any) => a.type === "REVENUE");
  const expenseAccounts = accounts.filter((a: any) => a.type === "EXPENSE");

  return {
    accounts,
    assetAccounts,
    liabilityAccounts,
    equityAccounts,
    revenueAccounts,
    expenseAccounts,
    isLoading,
    refetch
  };
}

export function useJournalEntry({ onSuccess }: { onSuccess?: () => void }) {
  const [createJournalEntry, { isLoading }] = useCreateJournalEntryMutation();

  const handleCreateEntry = async (data: any) => {
    try {
      // Validate double entry logic frontend-side before sending
      let totalDebit = 0;
      let totalCredit = 0;
      
      data.journalLines.forEach((line: any) => {
        totalDebit += Number(line.debit) || 0;
        totalCredit += Number(line.credit) || 0;
      });

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        toast.error("Journal entry must balance: Total Debit must equal Total Credit.");
        return;
      }

      await createJournalEntry(data).unwrap();
      toast.success("Journal entry created successfully.");
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create journal entry.");
      throw error;
    }
  };

  return {
    createJournalEntry: handleCreateEntry,
    isLoading
  };
}

export function useJournalEntries() {
  const { data, isLoading, refetch } = useGetAllJournalEntriesQuery();
  const entries = data?.data || [];
  return {
    entries,
    isLoading,
    refetch
  };
}
