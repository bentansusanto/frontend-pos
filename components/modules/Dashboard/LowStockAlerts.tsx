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
import { Button } from "@/components/ui/button";
import { useGetProductStocksQuery } from "@/store/services/product-stock.service";
import { IconAlertTriangle, IconPackage, IconRefresh } from "@tabler/icons-react";

export function LowStockAlerts() {
  // Poll every 30 seconds for real-time updates
  const { data: stocks, isLoading, isFetching, refetch } = useGetProductStocksQuery(undefined, {
    pollingInterval: 30_000,
  });

  const lowStockItems = React.useMemo(() => {
    if (!stocks || !Array.isArray(stocks)) return [];
    return stocks
      .filter((s: any) => s.stock <= (s.minStock ?? 0))
      .sort((a: any, b: any) => a.stock - b.stock)
      .slice(0, 6);
  }, [stocks]);

  if (isLoading) {
    return <div className="h-48 w-full animate-pulse rounded-lg bg-muted" />;
  }

  const isEmpty = lowStockItems.length === 0;

  return (
    <Card className={`@container/card ${isEmpty ? "" : "border-destructive/30"}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          {!isEmpty && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
              <IconAlertTriangle className="h-4 w-4 text-destructive" />
            </div>
          )}
          <div>
            <CardTitle className="text-base">Inventory Alerts</CardTitle>
            <CardDescription>
              {isEmpty ? "All stock levels healthy" : `${lowStockItems.length} item${lowStockItems.length > 1 ? "s" : ""} need restocking`}
            </CardDescription>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <IconRefresh className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>

      <CardContent>
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
              <IconPackage className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm text-muted-foreground">No alerts — stock levels are healthy!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lowStockItems.map((item: any, index: number) => {
              const isOut = item.stock === 0;
              const isCritical = item.stock > 0 && item.stock <= Math.ceil((item.minStock ?? 0) / 2);
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between gap-3 rounded-lg p-2 transition-colors ${
                    isOut
                      ? "bg-destructive/5"
                      : isCritical
                      ? "bg-orange-50 dark:bg-orange-950/20"
                      : "bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                        isOut
                          ? "bg-destructive/20"
                          : isCritical
                          ? "bg-orange-100 dark:bg-orange-900/40"
                          : "bg-muted"
                      }`}
                    >
                      <IconPackage
                        className={`h-3.5 w-3.5 ${
                          isOut
                            ? "text-destructive"
                            : isCritical
                            ? "text-orange-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium leading-tight truncate">
                        {item.productVariant?.product?.name_product}{" "}
                        {item.productVariant?.name_variant !== "Default" ? item.productVariant?.name_variant : ""}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        Min: {item.minStock ?? 0} · SKU: {item.productVariant?.sku ?? "—"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={isOut ? "destructive" : "outline"}
                    className={`shrink-0 text-xs font-semibold ${
                      !isOut && isCritical ? "border-orange-400 text-orange-500" : ""
                    } ${!isOut && !isCritical ? "border-yellow-400 text-yellow-600" : ""}`}
                  >
                    {isOut ? "Out!" : `${item.stock} left`}
                  </Badge>
                </div>
              );
            })}
            {/* Real-time indicator */}
            <p className="pt-1 text-center text-[10px] text-muted-foreground/60 flex items-center justify-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${isFetching ? "bg-yellow-400 animate-pulse" : "bg-emerald-400"}`} />
              {isFetching ? "Refreshing..." : "Live · updates every 30s"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
