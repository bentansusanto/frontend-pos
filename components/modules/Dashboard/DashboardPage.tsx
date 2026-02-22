"use client"

import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { SalesTable } from "@/components/modules/Dashboard/SalesTable"
import { useGetSalesSummaryQuery } from "@/store/services/sales-report.service"
import { useMemo } from "react"

export function DashboardPage() {
  const { data: summaryData, isLoading } = useGetSalesSummaryQuery()

  const chartData = useMemo(() => {
    if (!summaryData?.salesData) return []
    
    // Group sales by date
    const grouped = summaryData.salesData.reduce((acc: any, sale: any) => {
      const date = new Date(sale.paidAt).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + sale.totalAmount
      return acc
    }, {})

    // Convert to array and sort
    return Object.entries(grouped).map(([date, sales]) => ({
      date,
      sales: Number(sales),
    })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [summaryData])

  if (isLoading) {
    return <div className="p-8 text-center">Loading dashboard data...</div>
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between ">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
      </div>
      <SectionCards 
        totalSales={summaryData?.totalSales || 0}
        averageTransaction={summaryData?.averageTransaction || 0}
        totalCustomers={summaryData?.totalCustomers || 0}
        totalTransactions={summaryData?.totalTransactions || 0}
      />
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <ChartAreaInteractive data={chartData} />
      </div>
      <SalesTable data={summaryData?.salesData || []} />
    </div>
  )
}
