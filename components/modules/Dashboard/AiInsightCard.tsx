"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetAiInsightsQuery } from "@/store/services/ai-insight.service";
import { IconSparkles, IconTrendingUp, IconAlertTriangle } from "@tabler/icons-react";
import Link from "next/link";

export function AiInsightCard() {
  const { data: insights, isLoading } = useGetAiInsightsQuery({});

  const summaryInsight = React.useMemo(() => {
    if (!insights || insights.length === 0) return null;
    return insights.find((i: any) => i.type === "report_summary") || null;
  }, [insights]);

  if (isLoading) {
    return <div className="h-24 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />;
  }

  if (!summaryInsight) return null;

  const description = summaryInsight?.metadata?.executive_summary 
    || summaryInsight?.summary 
    || "Analyzing your business patterns...";

  return (
    <Card className="overflow-hidden border-primary/20 bg-primary/5 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase tracking-wider font-bold">
              AI Powered Insight
            </Badge>
          </div>
          <Link href="/dashboard/ai-insights" className="text-xs text-primary font-medium hover:underline">
            Full Analysis →
          </Link>
        </div>
        <CardTitle className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
          Business Intelligence Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

import { CheckCircle } from "lucide-react";
