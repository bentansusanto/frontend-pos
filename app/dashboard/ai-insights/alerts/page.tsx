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
import { AlertTriangle, Bell, Info } from "lucide-react";

export default function AlertsPage() {
  const { data: aiData, isLoading } = useGetAiInsightsQuery({});
  const alerts = aiData?.data?.alerts || [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">System Alerts</h1>
        <p className="text-muted-foreground">
          Critical notifications and warnings about your system and operations.
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-muted-foreground">Loading alerts...</div>
        </div>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>
                Recent alerts that require your attention.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No active alerts at this time.
                      </TableCell>
                    </TableRow>
                  ) : (
                    alerts.map((alert: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {alert.type === "critical" ? (
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            ) : alert.type === "warning" ? (
                              <Bell className="h-4 w-4 text-orange-500" />
                            ) : (
                              <Info className="h-4 w-4 text-blue-500" />
                            )}
                            <span className="capitalize">{alert.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{alert.message}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              alert.severity === "high"
                                ? "destructive"
                                : alert.severity === "medium"
                                ? "secondary" // "warning" variant might not exist, using secondary or default
                                : "outline"
                            }
                            className={`capitalize ${
                                alert.severity === "medium" ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800" : ""
                            }`}>
                            {alert.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(alert.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost">
                            Dismiss
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
