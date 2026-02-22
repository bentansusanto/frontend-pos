"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetAiInsightsQuery } from "@/store/services/ai-insight.service";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export default function SalesTrendsPage() {
  const { data: aiData, isLoading } = useGetAiInsightsQuery({});

  const salesTrends = aiData?.data?.sales_trends || [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Sales Trends</h1>
        <p className="text-muted-foreground">
          AI-powered analysis of your sales performance over time.
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-muted-foreground">Loading insights...</div>
        </div>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      className="text-xs text-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      className="text-xs text-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Date
                                  </span>
                                  <span className="font-bold text-muted-foreground">
                                    {payload[0].payload.date}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Revenue
                                  </span>
                                  <span className="font-bold text-primary">
                                    ${Number(payload[0].value).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             {/* Placeholder for other metrics if available */}
             <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        ${salesTrends.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0).toFixed(2)}
                    </div>
                </CardContent>
             </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Average Daily Sales</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        ${salesTrends.length ? (salesTrends.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0) / salesTrends.length).toFixed(2) : "0.00"}
                    </div>
                </CardContent>
             </Card>
          </div>
        </div>
      )}
    </div>
  );
}
