"use client";

import { Badge } from "@/components/ui/badge";
import {
  IconAlertTriangle,
  IconInfoCircle,
  IconPackage,
  IconTrendingUp,
  IconBolt,
  IconUser,
  IconFingerprint,
  IconCoin,
  IconCornerDownRight,
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

  const getTypeConfig = () => {
    switch (type) {
      case InsightType.STOCK_SUGGESTION:
      case InsightType.LOW_STOCK_ALERT:
        return { icon: IconPackage, label: "Stock Alert" };
      case InsightType.SALES_TREND:
      case InsightType.BEST_SELLER:
        return { icon: IconTrendingUp, label: "Sales Trend" };
      case InsightType.PROMO_SUGGESTION:
        return { icon: IconBolt, label: "Promo" };
      case InsightType.ANOMALY_ALERT:
        return { icon: IconAlertTriangle, label: "Anomaly Alert" };
      default:
        return { icon: IconInfoCircle, label: "Insight" };
    }
  };

  const { icon: Icon, label: typeLabel } = getTypeConfig();
  const riskLevel = meta.risk_level || meta.priority;
  const isHighRisk = riskLevel === "high" || riskLevel === "critical";
  const isMediumRisk = riskLevel === "medium";

  // ── Compact mode (Product Insights tab) ────────────────────────────────────
  if (compact) {
    return (
      <div className="w-full overflow-hidden flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/60">
        <div className="mt-0.5 shrink-0 rounded-md border border-slate-100 bg-slate-50 p-1.5 dark:border-slate-700 dark:bg-slate-800">
          <Icon className="h-4 w-4 text-slate-400" />
        </div>
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold leading-snug text-slate-900 dark:text-white truncate">
              {insight.summary}
            </p>
            {riskLevel && (
              <RiskBadge level={riskLevel} isHigh={isHighRisk} isMedium={isMediumRisk} />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {meta.message || meta.reason || meta.executive_summary || "Operational insight available."}
          </p>
        </div>
      </div>
    );
  }

  // ── Full card (Critical Alerts tab) ────────────────────────────────────────
  // IMPORTANT: overflow-hidden + w-full prevent horizontal page blowout
  return (
    <div className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* Header row */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <div className="mt-0.5 shrink-0 rounded-md border border-slate-100 bg-slate-50 p-1.5 dark:border-slate-700 dark:bg-slate-800">
          <Icon
            className={cn(
              "h-4 w-4",
              isHighRisk ? "text-red-500" : "text-slate-400"
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {typeLabel}
            </span>
            {riskLevel && (
              <RiskBadge level={riskLevel} isHigh={isHighRisk} isMedium={isMediumRisk} />
            )}
          </div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug break-words">
            {insight.summary}
          </p>
          {(meta.executive_summary || meta.message || meta.reason) && (
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed break-words">
              {meta.executive_summary || meta.message || meta.reason}
            </p>
          )}
        </div>
      </div>

      {/* Inline metadata row */}
      {(meta.sessionId || meta.cashierName || meta.diff !== undefined || meta.totalRefunds) && (
        <div className="mx-4 mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-md border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/40">
          {meta.sessionId && (
            <MetricInline
              icon={IconFingerprint}
              label="Session"
              value={`#${meta.sessionId}`}
              mono
            />
          )}
          {meta.cashierName && (
            <MetricInline
              icon={IconUser}
              label="Staff"
              value={meta.cashierName}
            />
          )}
          {meta.diff !== undefined && (
            <MetricInline
              icon={IconCoin}
              label="Discrepancy"
              value={`${meta.diff < 0 ? "-" : "+"}$${Math.abs(meta.diff).toFixed(2)}`}
              valueClass={
                meta.diff < 0
                  ? "text-red-500"
                  : "text-slate-700 dark:text-slate-200"
              }
            />
          )}
          {meta.totalRefunds && (
            <MetricInline
              icon={IconCoin}
              label="Refunds"
              value={`${meta.totalRefunds} txn`}
              valueClass="text-red-500"
            />
          )}
        </div>
      )}

      {/* Audit action row */}
      {meta.audit_hint && (
        <div className="flex items-start gap-2 border-t border-slate-100 px-4 py-2.5 dark:border-slate-800">
          <IconCornerDownRight className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
          <p className="text-xs text-slate-600 leading-relaxed dark:text-slate-400 break-words min-w-0">
            <span className="font-bold uppercase tracking-wider text-muted-foreground mr-1.5">
              Action
            </span>
            {meta.audit_hint}
          </p>
        </div>
      )}
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const RiskBadge = ({
  level,
  isHigh,
  isMedium,
}: {
  level: string;
  isHigh: boolean;
  isMedium: boolean;
}) => (
  <Badge
    variant="outline"
    className={cn(
      "shrink-0 h-4 px-1.5 text-[9px] font-bold uppercase tracking-wider",
      isHigh &&
        "border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400",
      isMedium &&
        "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400",
      !isHigh &&
        !isMedium &&
        "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
    )}
  >
    {level}
  </Badge>
);

const MetricInline = ({
  icon: Icon,
  label,
  value,
  mono = false,
  valueClass = "",
}: {
  icon: any;
  label: string;
  value: string;
  mono?: boolean;
  valueClass?: string;
}) => (
  <div className="flex items-center gap-1.5 min-w-0">
    <Icon className="h-3 w-3 text-muted-foreground shrink-0" />
    <span className="text-[10px] uppercase tracking-tight text-muted-foreground font-medium shrink-0">
      {label}
    </span>
    <span
      className={cn(
        "text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[120px]",
        mono && "font-mono",
        valueClass
      )}
    >
      {value}
    </span>
  </div>
);
