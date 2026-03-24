"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Bell, Info, Package, TrendingUp, Zap } from "lucide-react";
import { InsightType } from "@/types/ai-insight.type";

interface AiInsightCardProps {
  insight: any;
  compact?: boolean;
}

export const AiInsightCard = ({ insight, compact = false }: AiInsightCardProps) => {
  const meta = insight.metadata || {};
  const type = insight.type as InsightType;

  const getIcon = () => {
    switch (type) {
      case InsightType.STOCK_SUGGESTION:
      case InsightType.LOW_STOCK_ALERT:
        return <Package className="h-4 w-4 text-orange-500" />;
      case InsightType.SALES_TREND:
      case InsightType.BEST_SELLER:
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case InsightType.PROMO_SUGGESTION:
        return <Zap className="h-4 w-4 text-purple-500" />;
      case InsightType.ANOMALY_ALERT:
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  if (compact) {
    return (
      <div className="flex items-start gap-3 rounded-lg border bg-card p-2 shadow-sm transition-all hover:shadow-md">
        <div className="mt-0.5 rounded-full bg-muted p-1.5">
          {getIcon()}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold leading-none">
              {meta.product_name || insight.summary}
            </p>
            {meta.priority && (
              <Badge variant={meta.priority === 'high' ? 'destructive' : 'secondary'} className="h-4 px-1 text-[10px]">
                {meta.priority}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {meta.message || meta.reason || insight.summary}
          </p>
          {type === InsightType.STOCK_SUGGESTION && meta.recommended_quantity && (
            <p className="text-[10px] font-bold text-emerald-600">
              Recommend: +{meta.recommended_quantity}
            </p>
          )}
          {type === InsightType.PROMO_SUGGESTION && meta.recommended_discount_pct && (
            <p className="text-[10px] font-bold text-purple-600">
              Suggested: {meta.recommended_discount_pct}% Off
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border-l-4 border-l-primary/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            {getIcon()}
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="font-bold leading-none">{insight.summary}</h4>
            <p className="text-sm text-muted-foreground">
              {meta.message || meta.executive_summary || JSON.stringify(meta)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
