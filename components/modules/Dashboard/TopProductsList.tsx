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
import { formatCurrency } from "@/lib/utils";

interface TopProductsListProps {
  salesData: any[];
}

export function TopProductsList({ salesData }: TopProductsListProps) {
  const topProducts = React.useMemo(() => {
    const productStats: Record<string, { name: string; quantity: number; revenue: number }> = {};

    salesData.forEach((sale) => {
      if (sale.status !== "success") return;
      sale.items?.forEach((item: any) => {
        const key = item.productId || item.productName;
        if (!productStats[key]) {
          productStats[key] = {
            name: item.productName || "Unknown Product",
            quantity: 0,
            revenue: 0,
          };
        }
        productStats[key].quantity += item.quantity || 0;
        productStats[key].revenue += (item.subtotal || 0);
      });
    });

    return Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [salesData]);

  if (topProducts.length === 0) {
    return null;
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>Most popular items this period</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {product.quantity} units sold
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{formatCurrency(product.revenue)}</p>
                <Badge variant={index === 0 ? "default" : "secondary"}>
                  #{index + 1}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
