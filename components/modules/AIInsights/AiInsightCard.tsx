"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  IconAlertTriangle, 
  IconBell, 
  IconInfoCircle, 
  IconPackage, 
  IconTrendingUp, 
  IconBolt, 
  IconSparkles,
  IconClock,
  IconUser,
  IconFingerprint,
  IconCoin
} from "@tabler/icons-react";
import { InsightType } from "@/types/ai-insight.type";
import { cn } from "@/lib/utils";

interface AiInsightCardProps {
  insight: any;
  compact?: boolean;
}

export const AiInsightCard = ({ insight, compact = false }: AiInsightCardProps) => {
  const meta = insight.metadata || {};
  const type = insight.type as InsightType;

  const getIcon = (className?: string) => {
    const size = className ? "" : "h-4 w-4";
    const classes = cn(size, className);
    
    switch (type) {
      case InsightType.STOCK_SUGGESTION:
      case InsightType.LOW_STOCK_ALERT:
        return <IconPackage className={classes} />;
      case InsightType.SALES_TREND:
      case InsightType.BEST_SELLER:
        return <IconTrendingUp className={classes} />;
      case InsightType.PROMO_SUGGESTION:
        return <IconBolt className={classes} />;
      case InsightType.ANOMALY_ALERT:
        return <IconAlertTriangle className={classes} />;
      default:
        return <IconInfoCircle className={classes} />;
    }
  };

  const riskLevel = meta.risk_level || meta.priority;
  const isHighRisk = riskLevel === 'high' || riskLevel === 'critical';
  const isMediumRisk = riskLevel === 'medium';

  if (compact) {
    const badgeVariant = isHighRisk ? 'destructive' : 
                        isMediumRisk ? 'outline' : 'secondary';

    return (
      <div className="flex items-start gap-3 rounded-xl border bg-white p-3 shadow-sm transition-all hover:shadow-md dark:bg-slate-900">
        <div className={cn(
          "mt-0.5 rounded-lg p-2 shrink-0 shadow-inner",
          isHighRisk ? "bg-red-50 text-red-600 dark:bg-red-950/30" : "bg-primary/5 text-primary dark:bg-primary/10"
        )}>
          {getIcon("h-5 w-5")}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2 overflow-hidden">
            <p className="text-sm font-bold leading-tight truncate text-slate-900 dark:text-white">
              {insight.summary}
            </p>
            {riskLevel && (
              <Badge 
                variant={badgeVariant as any} 
                className={cn(
                  "h-4 px-1.5 text-[9px] uppercase tracking-wider font-black shrink-0",
                  isMediumRisk && "bg-amber-50 text-amber-700 border-amber-200"
                )}
              >
                {riskLevel}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {meta.message || meta.reason || meta.executive_summary || "Operational insight available"}
          </p>
        </div>
      </div>
    );
  }

  // Determine accent color
  const accentClass = isHighRisk 
    ? "border-l-red-500 bg-red-50/10 dark:bg-red-950/5" 
    : "border-l-primary bg-primary/5 dark:bg-primary/10";

  return (
    <Card className={cn(
      "overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md",
      "border-l-4",
      accentClass
    )}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={cn(
            "rounded-2xl p-3 shadow-inner shrink-0",
            isHighRisk ? "bg-red-100 text-red-600 dark:bg-red-900/40" : "bg-primary/10 text-primary"
          )}>
            {getIcon("h-6 w-6")}
          </div>
          
          <div className="flex-1 space-y-4">
            {/* Header Area */}
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-1">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[9px] uppercase tracking-[0.1em] font-black">
                  {type.replace("_", " ")}
                </Badge>
                <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  {insight.summary}
                </h4>
              </div>
              
              {riskLevel && (
                <Badge 
                  variant={isHighRisk ? "destructive" : "outline"} 
                  className={cn(
                    "text-[10px] px-2 py-0.5 uppercase tracking-widest font-black",
                    isMediumRisk && "bg-amber-50 text-amber-700 border-amber-200"
                  )}
                >
                  {riskLevel} RISK
                </Badge>
              )}
            </div>

            {/* Description / Summary - Only show if different from summary title */}
            {(meta.executive_summary || meta.message || meta.reason) && (
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                {meta.executive_summary || meta.message || meta.reason}
              </p>
            )}

            {/* Metrics Grid for Operational Anomalies */}
            {(meta.sessionId || meta.cashierName || meta.diff !== undefined || meta.totalRefunds || meta.discountPct) && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {meta.sessionId && (
                  <MetricBox 
                    icon={IconFingerprint} 
                    label="Transaction Session" 
                    value={`#${meta.sessionId}`} 
                    mono 
                  />
                )}
                {meta.cashierName && (
                  <MetricBox 
                    icon={IconUser} 
                    label="Responsible Staff" 
                    value={meta.cashierName} 
                  />
                )}
                {meta.diff !== undefined && (
                  <MetricBox 
                    icon={IconCoin} 
                    label="Discrepancy" 
                    value={`${meta.diff < 0 ? '-' : '+'}$${Math.abs(meta.diff).toFixed(2)}`}
                    accent={meta.diff < 0 ? 'destructive' : 'success'} 
                  />
                )}
                {meta.totalRefunds && (
                  <MetricBox 
                    icon={IconClock} 
                    label="Refund Events" 
                    value={`${meta.totalRefunds} transactions`} 
                    accent="destructive"
                  />
                )}
              </div>
            )}

            {/* Audit Hint - The Action Box */}
            {meta.audit_hint && (
              <div className="flex items-start gap-3 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 rounded-2xl shadow-sm">
                <div className="bg-blue-100 dark:bg-blue-800 p-1.5 rounded-lg">
                  <IconSparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[10px] uppercase tracking-widest font-black text-blue-600/70 dark:text-blue-400/70">
                    Recommended Audit Action
                  </span>
                  <p className="text-xs text-blue-900 dark:text-blue-300 font-bold leading-normal">
                    {meta.audit_hint}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper component for cleanly styled metrics
const MetricBox = ({ 
  icon: Icon, 
  label, 
  value, 
  mono = false,
  accent = 'default'
}: { 
  icon: any, 
  label: string, 
  value: string, 
  mono?: boolean,
  accent?: 'default' | 'destructive' | 'success' 
}) => {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 p-2.5 transition-colors hover:bg-white dark:hover:bg-slate-800 shadow-sm">
      <div className="flex items-center gap-1.5 opacity-60">
        <Icon className="h-3 w-3" />
        <span className="text-[10px] uppercase tracking-tight font-bold">{label}</span>
      </div>
      <span className={cn(
        "text-xs font-black truncate",
        mono && "font-mono tracking-tighter",
        accent === 'destructive' && "text-red-600",
        accent === 'success' && "text-emerald-600"
      )}>
        {value}
      </span>
    </div>
  );
};
