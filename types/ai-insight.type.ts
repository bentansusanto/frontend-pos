export enum InsightType {
  SALES_TREND = 'sales_trend',
  STOCK_SUGGESTION = 'stock_suggestion',
  BEST_SELLER = 'best_seller',
  SLOW_MOVING = 'slow_moving',
  LOW_STOCK_ALERT = 'low_stock_alert',
  EXPIRY_ALERT = 'expiry_alert',
  ANOMALY_ALERT = 'anomaly_alert',
  PROMO_SUGGESTION = 'promo_suggestion',
  REPORT_SUMMARY = 'report_summary',
}

export interface AiInsight {
  id: string;
  type: InsightType;
  summary: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}
