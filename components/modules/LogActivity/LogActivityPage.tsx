"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { type ActionType, type EntityType, type UserLog } from "@/store/services/user-log.service";
import { format, formatDistanceToNow } from "date-fns";
import {
  Activity,
  Clock,
  Eye,
  Filter,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  X
} from "lucide-react";
import { ACTION_COLORS, ENTITY_ICONS, useLogActivity } from "./hooks";

// ── Action Badge ───────────────────────────────────────────────────────────────
function ActionBadge({ action }: { action: ActionType }) {
  const style = ACTION_COLORS[action] ?? {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400"
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        style.bg,
        style.text
      )}>
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {action}
    </span>
  );
}

// ── Log Detail Dialog ──────────────────────────────────────────────────────────
function LogDetailDialog({
  log,
  trigger,
  userMap
}: {
  log: UserLog;
  trigger: React.ReactNode;
  userMap: Record<string, string>;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="text-primary h-4 w-4" />
            Activity Log Detail
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="bg-muted/30 space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <ActionBadge action={log.action} />
              <span className="text-muted-foreground text-xs">
                {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm:ss")}
              </span>
            </div>
            <p className="text-sm font-medium">{log.description ?? "No description"}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Module", value: log.module },
              { label: "User", value: userMap?.[log.user_id] || log.user_id || "—" },
              { label: "Branch ID", value: log.branch_id || "—" },
              { label: "IP Address", value: log.ip_address ?? "—" }
            ].map((row) => (
              <div key={row.label} className="rounded-md border p-2.5">
                <p className="text-muted-foreground text-xs">{row.label}</p>
                <p className="mt-0.5 font-mono text-xs break-all">{row.value}</p>
              </div>
            ))}
          </div>
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div>
              <p className="text-muted-foreground mb-2 text-xs font-medium">Metadata</p>
              <pre className="bg-muted max-h-40 overflow-auto rounded-lg p-3 text-xs">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function LogActivityPage() {
  const {
    logs,
    filtered,
    isLoading,
    isFetching,
    refetch,
    filters,
    search,
    setSearch,
    actionCounts,
    topAction,
    hasFilters,
    userMap,
    setEntityFilter,
    setActionFilter,
    toggleActionFilter,
    clearFilters,
    nextPage,
    prevPage,
    total
  } = useLogActivity();

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
            <Activity className="h-5 w-5 text-white" />
            <span className="ring-background absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-green-500 ring-2">
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Activity Logs</h1>
            <p className="text-muted-foreground text-sm">Real-time user activity monitoring</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => refetch()}
          disabled={isFetching}>
          <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="col-span-2 rounded-xl border bg-gradient-to-br from-indigo-50 to-purple-50 p-4 sm:col-span-1 dark:from-indigo-950/30 dark:to-purple-950/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">
                {total}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">Total Events</p>
            </div>
            <TrendingUp className="h-8 w-8 text-indigo-300" />
          </div>
        </div>
        {(["create", "update", "delete"] as ActionType[]).map((action) => {
          const style = ACTION_COLORS[action];
          return (
            <div key={action} className={cn("rounded-xl border p-4", style.bg)}>
              <div className="flex items-end justify-between">
                <div>
                  <p className={cn("text-3xl font-bold", style.text)}>
                    {actionCounts[action] ?? 0}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs capitalize">{action}</p>
                </div>
                <span className={cn("mb-1 h-2 w-2 rounded-full", style.dot)} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Breakdown (clickable) */}
      <div className="bg-card rounded-xl border p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">Action Breakdown</p>
          {topAction && (
            <Badge variant="secondary" className="text-xs capitalize">
              Top: {topAction[0]} ({topAction[1]})
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(ACTION_COLORS) as ActionType[]).map((action) => {
            const style = ACTION_COLORS[action];
            const count = actionCounts[action] ?? 0;
            const pct = logs.length > 0 ? Math.round((count / logs.length) * 100) : 0;
            return (
              <button
                key={action}
                onClick={() => toggleActionFilter(action)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-all",
                  filters.action === action
                    ? cn(style.bg, style.text, "ring-2 ring-current ring-offset-1")
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}>
                <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
                {action}
                <span className="font-bold">{pct}%</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              className="pl-9"
              placeholder="Search by description, entity, user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={filters.entityType ?? "all"}
            onValueChange={(v) => setEntityFilter(v === "all" ? undefined : (v as EntityType))}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-3.5 w-3.5" />
              <SelectValue placeholder="Entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              {Object.entries(ENTITY_ICONS).map(([key, icon]) => (
                <SelectItem key={key} value={key} className="capitalize">
                  {icon} {key.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.action ?? "all"}
            onValueChange={(v) => setActionFilter(v === "all" ? undefined : (v as ActionType))}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {(Object.keys(ACTION_COLORS) as ActionType[]).map((a) => (
                <SelectItem key={a} value={a} className="capitalize">
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-1.5"
              onClick={clearFilters}>
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
          <Badge variant="secondary" className="ml-auto">
            {filtered.length} events
          </Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>User</TableHead>
              <TableHead>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Time
                </span>
              </TableHead>
              <TableHead className="text-right">Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                    <ShieldCheck className="text-muted-foreground h-7 w-7" />
                  </div>
                  <p className="mt-4 font-medium">No activity found</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {hasFilters
                      ? "Try adjusting your filters."
                      : "Activity appears here once users perform actions."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((log) => (
                <TableRow key={log.id} className="group">
                  <TableCell>
                    <ActionBadge action={log.action} />
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm">
                      <span>{ENTITY_ICONS[log.module] ?? "📌"}</span>
                      <span className="text-muted-foreground capitalize">
                        {(log?.module ?? "").replace(/_/g, " ")}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[260px]">
                    <p className="truncate text-sm">{log.description ?? "—"}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold">
                        {(userMap[log.user_id] ?? log.user_id ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="text-muted-foreground max-w-[120px] truncate text-xs">
                        {userMap[log.user_id] ?? `${(log.user_id ?? "").slice(0, 8)}…`}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                    <span
                      title={format(new Date(log.createdAt), "dd MMM yyyy, HH:mm")}
                      className="cursor-default">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <LogDetailDialog
                      log={log}
                      userMap={userMap}
                      trigger={
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-muted-foreground text-xs">
              Showing {(filters.page - 1) * filters.limit + 1} -{" "}
              {Math.min(filters.page * filters.limit, total)} of {total} events • Page {filters.page}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={(filters.page ?? 1) <= 1}
                onClick={prevPage}>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page * filters.limit >= total}
                onClick={nextPage}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
