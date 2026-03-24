"use client";

import { useGetAiInsightsQuery } from "@/store/services/ai-insight.service";
import { AiInsightCard } from "./AiInsightCard";
import { Loader2, Sparkles } from "lucide-react";
import { InsightType } from "@/types/ai-insight.type";

interface AiInsightSectionProps {
  branchId: string;
  types?: InsightType[];
  title?: string;
  limit?: number;
}

export const AiInsightSection = ({ 
  branchId, 
  types, 
  title = "AI Business Insights",
  limit = 3 
}: AiInsightSectionProps) => {
  const { data: insightsData, isLoading } = useGetAiInsightsQuery(
    branchId && branchId !== "all" ? { branchId } : {}
  );

  const insights = Array.isArray(insightsData) ? insightsData : [];
  
  const filteredInsights = insights
    .filter((insight: any) => !types || types.includes(insight.type as InsightType))
    .slice(0, limit);

  if (isLoading) {
    return (
      <div className="flex h-20 items-center justify-center rounded-xl border border-dashed p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (filteredInsights.length === 0) {
    return null; // Don't show anything if no relevant insights
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1 mb-1">
        <div className="rounded-lg bg-indigo-100 p-1 dark:bg-indigo-900/30">
          <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h4 className="text-sm font-bold tracking-tight text-foreground uppercase">
          {title}
        </h4>
      </div>
      <div className="grid gap-3">
        {filteredInsights.map((insight: any) => (
          <AiInsightCard key={insight.id} insight={insight} compact />
        ))}
      </div>
    </div>
  );
};
