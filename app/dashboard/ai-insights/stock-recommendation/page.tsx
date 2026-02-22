"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useGetAiInsightsQuery } from "@/store/services/ai-insight.service";
import { AlertCircle, ArrowRight, Package } from "lucide-react";

export default function StockRecommendationPage() {
  const { data: aiData, isLoading } = useGetAiInsightsQuery({});
  const recommendations = aiData?.data?.stock_recommendations || [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Stock Recommendation</h1>
        <p className="text-muted-foreground">
          AI-driven suggestions for inventory replenishment and optimization.
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-muted-foreground">Loading recommendations...</div>
        </div>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Restock Suggestions</CardTitle>
              <CardDescription>
                Products that are running low and need immediate attention.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Recommended Order</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recommendations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No critical stock recommendations at this time.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recommendations.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            {item.product_name}
                          </div>
                        </TableCell>
                        <TableCell>{item.current_stock}</TableCell>
                        <TableCell>{item.recommended_quantity}</TableCell>
                        <TableCell>
                          <Badge
                            variant={item.priority === "high" ? "destructive" : "secondary"}
                            className="capitalize">
                            {item.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline">
                            Create PO <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <AlertCircle className="h-5 w-5" /> Low Stock Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  {recommendations.filter((r: any) => r.priority === "high").length} products are critically low on stock. Consider placing orders immediately to avoid stockouts.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
