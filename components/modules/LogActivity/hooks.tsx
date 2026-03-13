"use client";

import {
  useGetUserLogsQuery,
  type ActionType,
  type EntityType,
  type UserLogFilters
} from "@/store/services/user-log.service";
import { useGetAllUsersQuery } from "@/store/services/user.service";
import { useMemo, useState } from "react";

// ── Action colour map (lowercase keys = backend ActionType) ────────────────────
export const ACTION_COLORS: Record<ActionType, { bg: string; text: string; dot: string }> = {
  create: { bg: "bg-emerald-500/10", text: "text-emerald-700", dot: "bg-emerald-500" },
  update: { bg: "bg-blue-500/10", text: "text-blue-700", dot: "bg-blue-500" },
  delete: { bg: "bg-red-500/10", text: "text-red-700", dot: "bg-red-500" },
  login: { bg: "bg-violet-500/10", text: "text-violet-700", dot: "bg-violet-500" },
  logout: { bg: "bg-orange-500/10", text: "text-orange-700", dot: "bg-orange-500" },
  approve: { bg: "bg-teal-500/10", text: "text-teal-700", dot: "bg-teal-500" },
  cancel: { bg: "bg-rose-500/10", text: "text-rose-700", dot: "bg-rose-500" }
};

// ── Entity icon map (lowercase keys = backend EntityType) ─────────────────────
export const ENTITY_ICONS: Record<string, string> = {
  product: "�",
  product_variant: "🏷️",
  sale: "�",
  purchase: "🛒",
  purchase_receiving: "�",
  stock_movement: "�",
  stock_adjustment: "⚖️",
  customer: "�",
  supplier: "🚚",
  expense: "�",
  user: "�",
  tax: "🧾",
  discount: "🎟️"
};

export function useLogActivity() {
  const [filters, setFilters] = useState<UserLogFilters & { page: number; limit: number }>({
    page: 1,
    limit: 10
  });
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching, refetch } = useGetUserLogsQuery(filters);
  const logs = data?.datas || [];
  const total = data?.total || 0;
  const { data: users = [] } = useGetAllUsersQuery();

  // Build a map userId → displayName for O(1) lookup in table rows
  const userMap = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    users.forEach((u: any) => {
      map[u.id] = u.name || u.email || u.id;
    });
    return map;
  }, [users]);

  const filtered = search
    ? logs.filter(
        (l) =>
          (l.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (l.module ?? "").toLowerCase().includes(search.toLowerCase()) ||
          l.action.toLowerCase().includes(search.toLowerCase()) ||
          (userMap[l.user_id] ?? l.user_id ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  const actionCounts = logs.reduce(
    (acc, l) => {
      acc[l.action] = (acc[l.action] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const topAction = Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0];

  const setEntityFilter = (entityType?: EntityType) =>
    setFilters((p) => ({ ...p, entityType, page: 1 }));

  const setActionFilter = (action?: ActionType) => setFilters((p) => ({ ...p, action, page: 1 }));

  const toggleActionFilter = (action: ActionType) =>
    setFilters((p) => ({ ...p, action: p.action === action ? undefined : action, page: 1 }));

  const clearFilters = () => setFilters({ page: 1, limit: 50 });

  const nextPage = () => setFilters((p) => ({ ...p, page: p.page + 1 }));
  const prevPage = () => setFilters((p) => ({ ...p, page: Math.max(1, p.page - 1) }));

  const hasFilters = !!(filters.entityType || filters.action || filters.userId);

  return {
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
  };
}
