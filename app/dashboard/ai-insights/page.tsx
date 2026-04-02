"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, cn } from "@/lib/utils";
import {
  useGenerateAiInsightsMutation,
  useGetAiInsightsQuery
} from "@/store/services/ai-insight.service";
import { getCookie } from "@/utils/cookies";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BrainCircuit,
  CheckCircle,
  Info,
  Loader2,
  Package,
  TrendingUp,
  X
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { AiInsightCard } from "@/components/modules/AIInsights/AiInsightCard";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";

const chartConfig = {
  amount: {
    label: "Sales",
    color: "var(--primary)"
  }
} satisfies ChartConfig;

export default function AiInsightsDashboardPage() {
  const branchId = getCookie("pos_branch_id");
  const {
    data: aiData,
    isLoading,
    isFetching
  } = useGetAiInsightsQuery(branchId ? { branchId } : {});
  const [generateAiInsights, { isLoading: isGenerating }] = useGenerateAiInsightsMutation();
  const [timeRange, setTimeRange] = useState("monthly");
  const [recommendationsPage, setRecommendationsPage] = useState(1);
  const [alertsPage, setAlertsPage] = useState(1);
  const [promoPage, setPromoPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  const insights = Array.isArray(aiData) ? aiData : [];

  const salesTrends = insights.filter((i: any) => i.type === "sales_trend");
  const recommendations = insights.filter((i: any) =>
    ["stock_suggestion", "best_seller", "slow_moving"].includes(i.type)
  );
  const alerts = insights.filter((i: any) =>
    ["low_stock_alert", "expiry_alert", "anomaly_alert"].includes(i.type)
  );
  const promoSuggestions = insights.filter((i: any) => i.type === "promo_suggestion");
  const summary = insights.find((i: any) => i.type === "report_summary") || {};
  const summaryMetadata = summary.metadata || {};

  // Calculate last updated time from the most recent insight
  const lastUpdated = useMemo(() => {
    if (insights.length === 0) return null;
    return new Date(Math.max(...insights.map((i: any) => new Date(i.createdAt).getTime())));
  }, [insights]);

  const totalRecommendationPages = Math.ceil(recommendations.length / ITEMS_PER_PAGE);
  const paginatedRecommendations = recommendations.slice(
    (recommendationsPage - 1) * ITEMS_PER_PAGE,
    recommendationsPage * ITEMS_PER_PAGE
  );

  const totalAlertPages = Math.ceil(alerts.length / ITEMS_PER_PAGE);
  const paginatedAlerts = alerts.slice(
    (alertsPage - 1) * ITEMS_PER_PAGE,
    alertsPage * ITEMS_PER_PAGE
  );

  const totalPromoPages = Math.ceil(promoSuggestions.length / ITEMS_PER_PAGE);
  const paginatedPromos = promoSuggestions.slice(
    (promoPage - 1) * ITEMS_PER_PAGE,
    promoPage * ITEMS_PER_PAGE
  );

  // ── Mapped chart data (Aggregated by date to prevent duplicates) ────────────────
  const salesTrendsChartData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    
    salesTrends.forEach((i: any) => {
      const meta = i.metadata || {};
      const rawDate = meta.date || meta.timestamp || i.createdAt;
      if (!rawDate) return;
      
      const dateKey = new Date(rawDate).toISOString().split('T')[0];
      const amount = Number(meta.amount || meta.totalRevenue || meta.revenue || 0);
      
      dataMap[dateKey] = (dataMap[dateKey] || 0) + amount;
    });

    return Object.entries(dataMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [salesTrends]);

  const handleGenerateAnalysis = async () => {
    try {
      await generateAiInsights({
        branchId: branchId || "",
        timeRange,
        force: true
      }).unwrap();
      toast.success(`Analysis refreshed successfully!`);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to refresh analysis.");
    }
  };

  return (
    <div className="w-full space-y-6 p-2.5 sm:p-6 min-w-0">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">AI Insights Dashboard</h1>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase tracking-wider">
              System Automated
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Comprehensive AI-powered analysis. Updated daily at 01:00 AM.
          </p>
          {lastUpdated && (
            <p className="text-[10px] font-medium text-slate-400 italic mt-1">
              Last Analysis: {new Date(lastUpdated).toLocaleString("en-US", { 
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
              })}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily View</SelectItem>
              <SelectItem value="weekly">Weekly View</SelectItem>
              <SelectItem value="monthly">Monthly View</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleGenerateAnalysis}
            disabled={isGenerating}
            size="sm"
            className="gap-2 shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 active:scale-95"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <BrainCircuit className="h-4 w-4" />
                Refresh Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <Loader2 className="text-primary h-10 w-10 animate-spin" />
          <p className="text-muted-foreground animate-pulse">Gathering intelligence...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Top Section: AI Summary & Highlights */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border-l-primary border-l-4 col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="text-primary h-5 w-5" />
                  Executive Summary
                </CardTitle>
                <CardDescription>
                  High-level overview generated by AI based on recent data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed break-words">
                    {summaryMetadata.executive_summary ||
                      "No summary available. Click 'Refresh Analysis' to start."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Key Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {(summaryMetadata.highlights || [])
                    .slice(0, 5)
                    .map((highlight: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="mt-1 rounded-full bg-green-100 p-1 dark:bg-green-900/30">
                          <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm font-medium">{highlight}</span>
                      </li>
                    ))}
                  {(!summaryMetadata.highlights || summaryMetadata.highlights.length === 0) && (
                    <li className="text-muted-foreground text-sm">No highlights found.</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="trends" className="space-y-6">
            <TabsList className="flex flex-wrap h-auto w-full justify-start gap-1 bg-slate-100 p-1 dark:bg-slate-800 mb-2">
              <TabsTrigger value="trends" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Sales Trends
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="gap-2">
                <Package className="h-4 w-4" />
                Product Insights
              </TabsTrigger>
              <TabsTrigger value="alerts" className="gap-2 text-destructive data-[state=active]:bg-destructive data-[state=active]:text-white">
                <Bell className="h-4 w-4" />
                Critical Alerts
              </TabsTrigger>
              <TabsTrigger value="promos" className="gap-2">
                <ArrowRight className="h-4 w-4" />
                Promo Strategy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trends">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Forecast & Trends</CardTitle>
                  <CardDescription>Visualizing your business growth over time.</CardDescription>
                </CardHeader>
                <CardContent>
                  {salesTrendsChartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="aspect-auto h-[250px] sm:h-[350px] md:h-[400px] w-full">
                      <AreaChart data={salesTrendsChartData}>
                        <defs>
                          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-amount)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-amount)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                        />
                        <YAxis tickFormatter={(value) => `$${value}`} />
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
                        <Area
                          type="monotone"
                          dataKey="amount"
                          stroke="var(--color-amount)"
                          fillOpacity={1}
                          fill="url(#colorAmount)"
                        />
                      </AreaChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex h-[300px] items-center justify-center rounded-lg border-2 border-dashed bg-slate-50/50">
                      <p className="text-muted-foreground italic">Insufficient data for chart generation.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Intelligence</CardTitle>
                  <CardDescription>AI-driven suggestions for stock management.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 min-w-0">
                    {paginatedRecommendations.map((rec: any) => (
                      <AiInsightCard key={rec.id} insight={rec} compact={true} />
                    ))}
                  </div>
                  {totalRecommendationPages > 1 && (
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-muted-foreground">
                        Showing{" "}
                        <span className="font-semibold text-foreground">
                          {(recommendationsPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(recommendationsPage * ITEMS_PER_PAGE, recommendations.length)}
                        </span>{" "}of{" "}
                        <span className="font-semibold text-foreground">{recommendations.length}</span> records
                      </p>
                      <Pagination className="mx-0 w-auto justify-end">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => { e.preventDefault(); if (recommendationsPage > 1) setRecommendationsPage(recommendationsPage - 1); }}
                              className={recommendationsPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalRecommendationPages }, (_, i) => i + 1)
                            .filter((p) => p === 1 || p === totalRecommendationPages || Math.abs(p - recommendationsPage) <= 1)
                            .map((page, index, arr) => {
                              const showEllipsis = arr[index - 1] && page - arr[index - 1] > 1;
                              return (
                                <React.Fragment key={page}>
                                  {showEllipsis && <PaginationItem><PaginationEllipsis /></PaginationItem>}
                                  <PaginationItem>
                                    <PaginationLink
                                      href="#"
                                      isActive={recommendationsPage === page}
                                      onClick={(e) => { e.preventDefault(); setRecommendationsPage(page); }}
                                    >
                                      {page}
                                    </PaginationLink>
                                  </PaginationItem>
                                </React.Fragment>
                              );
                            })}
                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => { e.preventDefault(); if (recommendationsPage < totalRecommendationPages) setRecommendationsPage(recommendationsPage + 1); }}
                              className={recommendationsPage === totalRecommendationPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts">
              <Card className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Actionable Alerts
                      </CardTitle>
                      <CardDescription className="mt-0.5">Critical issues requiring immediate attention.</CardDescription>
                    </div>
                    {alerts.length > 0 && (
                      <span className="text-xs font-medium text-muted-foreground">
                        {alerts.length} alert{alerts.length !== 1 ? "s" : ""} detected
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="w-full space-y-3">
                    {paginatedAlerts.length > 0 ? (
                      paginatedAlerts.map((alert: any) => (
                        <AiInsightCard key={alert.id} insight={alert} />
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 py-14 text-center dark:border-slate-800">
                        <CheckCircle className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Critical Issues</p>
                        <p className="text-xs text-muted-foreground">Your inventory and sales patterns look healthy.</p>
                      </div>
                    )}
                  </div>
                  {totalAlertPages > 1 && (
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-muted-foreground">
                        Showing{" "}
                        <span className="font-semibold text-foreground">
                          {(alertsPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(alertsPage * ITEMS_PER_PAGE, alerts.length)}
                        </span>{" "}of{" "}
                        <span className="font-semibold text-foreground">{alerts.length}</span> records
                      </p>
                      <Pagination className="mx-0 w-auto justify-end">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => { e.preventDefault(); if (alertsPage > 1) setAlertsPage(alertsPage - 1); }}
                              className={alertsPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalAlertPages }, (_, i) => i + 1)
                            .filter((p) => p === 1 || p === totalAlertPages || Math.abs(p - alertsPage) <= 1)
                            .map((page, index, arr) => {
                              const showEllipsis = arr[index - 1] && page - arr[index - 1] > 1;
                              return (
                                <React.Fragment key={page}>
                                  {showEllipsis && <PaginationItem><PaginationEllipsis /></PaginationItem>}
                                  <PaginationItem>
                                    <PaginationLink
                                      href="#"
                                      isActive={alertsPage === page}
                                      onClick={(e) => { e.preventDefault(); setAlertsPage(page); }}
                                    >
                                      {page}
                                    </PaginationLink>
                                  </PaginationItem>
                                </React.Fragment>
                              );
                            })}
                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => { e.preventDefault(); if (alertsPage < totalAlertPages) setAlertsPage(alertsPage + 1); }}
                              className={alertsPage === totalAlertPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="promos">
              <Card>
                <CardHeader>
                  <CardTitle>Promotion Suggestions</CardTitle>
                  <CardDescription>AI recommendations for increasing conversion.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 min-w-0">
                    {paginatedPromos.length > 0 ? (
                      paginatedPromos.map((promo: any) => (
                        <AiInsightCard key={promo.id} insight={promo} />
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 py-14 text-center dark:border-slate-800">
                        <CheckCircle className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Suggestions</p>
                        <p className="text-xs text-muted-foreground">Promo strategy recommendations will appear here.</p>
                      </div>
                    )}
                  </div>
                  {totalPromoPages > 1 && (
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-muted-foreground">
                        Showing{" "}
                        <span className="font-semibold text-foreground">
                          {(promoPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(promoPage * ITEMS_PER_PAGE, promoSuggestions.length)}
                        </span>{" "}of{" "}
                        <span className="font-semibold text-foreground">{promoSuggestions.length}</span> records
                      </p>
                      <Pagination className="mx-0 w-auto justify-end">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => { e.preventDefault(); if (promoPage > 1) setPromoPage(promoPage - 1); }}
                              className={promoPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalPromoPages }, (_, i) => i + 1)
                            .filter((p) => p === 1 || p === totalPromoPages || Math.abs(p - promoPage) <= 1)
                            .map((page, index, arr) => {
                              const showEllipsis = arr[index - 1] && page - arr[index - 1] > 1;
                              return (
                                <React.Fragment key={page}>
                                  {showEllipsis && <PaginationItem><PaginationEllipsis /></PaginationItem>}
                                  <PaginationItem>
                                    <PaginationLink
                                      href="#"
                                      isActive={promoPage === page}
                                      onClick={(e) => { e.preventDefault(); setPromoPage(page); }}
                                    >
                                      {page}
                                    </PaginationLink>
                                  </PaginationItem>
                                </React.Fragment>
                              );
                            })}
                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => { e.preventDefault(); if (promoPage < totalPromoPages) setPromoPage(promoPage + 1); }}
                              className={promoPage === totalPromoPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
