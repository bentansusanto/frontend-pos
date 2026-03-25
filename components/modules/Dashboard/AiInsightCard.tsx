"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetAiInsightsQuery } from "@/store/services/ai-insight.service";
import { IconSparkles, IconTrendingUp, IconAlertTriangle } from "@tabler/icons-react";

export function AiInsightCard() {
  const { data: insights, isLoading } = useGetAiInsightsQuery({});

  const latestInsight = React.useMemo(() => {
    if (!insights || insights.length === 0) return null;
    return insights[0]; // Already sorted by DESC in backend
  }, [insights]);

  if (isLoading) {
    return <div className="h-32 w-full animate-pulse rounded-lg bg-muted" />;
  }

  if (!latestInsight) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'sales_trend':
      case 'best_seller':
        return <IconTrendingUp className="h-5 w-5 text-primary" />;
      case 'low_stock_alert':
      case 'expiry_alert':
      case 'anomaly_alert':
        return <IconAlertTriangle className="h-5 w-5 text-destructive" />;
      default:
        return <IconSparkles className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-primary/5 @container/card">
      <div className="absolute -right-4 -top-4 opacity-10">
        <IconSparkles className="h-24 w-24 text-primary" />
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-primary/50 text-primary">
            AI Insight
          </Badge>
          <span className="text-xs text-muted-foreground">Latest Trends</span>
        </div>
        <CardTitle className="mt-2 flex items-center gap-2 text-lg">
          {getIcon(latestInsight.type)}
          {latestInsight.summary}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {latestInsight.metadata?.executive_summary || latestInsight.metadata?.message || "AI has analyzed your data and found some interesting patterns."}
        </p>
      </CardContent>
    </Card>
  );
}
