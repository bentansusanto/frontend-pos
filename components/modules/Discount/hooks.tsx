"use client";

import {
  useCreateDiscountMutation,
  useDeleteDiscountMutation,
  useGetDiscountsQuery,
  useUpdateDiscountMutation,
  type Discount
} from "@/store/services/discount.service";
import { useFormik } from "formik";
import { useState } from "react";
import { toast } from "sonner";
import { discountSchema, updateDiscountSchema, type DiscountFormValues } from "./schema";

// ── Zod → Formik errors helper ─────────────────────────────────────────────────
function zodToFormikErrors(issues: { path: (string | number)[]; message: string }[]) {
  const errors: Record<string, string> = {};
  issues.forEach((issue) => {
    if (issue.path[0]) errors[issue.path[0] as string] = issue.message;
  });
  return errors;
}

// ── Convert ISO datetime → "YYYY-MM-DD" for <input type="date"> ───────────────
function toDateInput(value: string | null | undefined): string {
  if (!value) return "";
  // Already "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  // ISO datetime like "2026-03-04T00:00:00.000Z"
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

// ── Status helper ─────────────────────────────────────────────────────────────
export function getDiscountStatus(d: Discount): {
  label: "Active" | "Scheduled" | "Expired" | "Inactive";
  className: string;
} {
  if (!d.isActive)
    return {
      label: "Inactive",
      className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
    };
  const now = new Date();
  if (d.startDate && new Date(d.startDate) > now)
    return {
      label: "Scheduled",
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
    };
  if (d.endDate && new Date(d.endDate) < now)
    return {
      label: "Expired",
      className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
    };
  return {
    label: "Active",
    className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
  };
}

// ── List + Delete ─────────────────────────────────────────────────────────────
export function useDiscountList() {
  const { data: discounts = [], isLoading, isError, refetch } = useGetDiscountsQuery();
  const [deleteDiscount, { isLoading: isDeleting }] = useDeleteDiscountMutation();
  const [search, setSearch] = useState("");

  const filtered = discounts.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete discount "${name}"?`)) return;
    try {
      await deleteDiscount(id).unwrap();
      toast.success(`"${name}" deleted`);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to delete");
    }
  };

  const stats = {
    total: discounts.length,
    active: discounts.filter((d) => getDiscountStatus(d).label === "Active").length,
    percentage: discounts.filter((d) => d.type === "percentage").length,
    fixed: discounts.filter((d) => d.type === "fixed").length
  };

  return {
    discounts,
    filtered,
    isLoading,
    isError,
    isDeleting,
    search,
    setSearch,
    handleDelete,
    stats,
    refetch
  };
}

// ── Create ────────────────────────────────────────────────────────────────────
interface UseCreateDiscountProps {
  onSuccess: () => void;
}

export function useCreateDiscount({ onSuccess }: UseCreateDiscountProps) {
  const [createDiscount, { isLoading }] = useCreateDiscountMutation();

  const formik = useFormik<DiscountFormValues>({
    initialValues: {
      name: "",
      description: "",
      type: "percentage",
      value: 0,
      isActive: true,
      startDate: "",
      endDate: ""
    },
    validate: (values) => {
      const result = discountSchema.safeParse({ ...values, value: Number(values.value) });
      if (!result.success) return zodToFormikErrors(result.error.issues);
      return {};
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await createDiscount({ ...values, value: Number(values.value) }).unwrap();
        toast.success("Discount created");
        resetForm();
        onSuccess();
      } catch (err: any) {
        toast.error(err?.data?.message ?? "Failed to create discount");
      } finally {
        setSubmitting(false);
      }
    }
  });

  return { formik, isLoading };
}

// ── Update ────────────────────────────────────────────────────────────────────
interface UseUpdateDiscountProps {
  onSuccess: () => void;
  initialData: Discount;
}

export function useUpdateDiscount({ onSuccess, initialData }: UseUpdateDiscountProps) {
  const [updateDiscount, { isLoading }] = useUpdateDiscountMutation();

  const formik = useFormik<DiscountFormValues>({
    initialValues: {
      name: initialData.name,
      description: initialData.description ?? "",
      type: initialData.type,
      value: initialData.value,
      isActive: initialData.isActive,
      startDate: toDateInput(initialData.startDate),
      endDate: toDateInput(initialData.endDate)
    },
    enableReinitialize: true,
    validate: (values) => {
      const result = updateDiscountSchema.safeParse({ ...values, value: Number(values.value) });
      if (!result.success) return zodToFormikErrors(result.error.issues);
      return {};
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await updateDiscount({
          id: initialData.id,
          data: { ...values, value: Number(values.value) }
        }).unwrap();
        toast.success("Discount updated");
        resetForm();
        onSuccess();
      } catch (err: any) {
        toast.error(err?.data?.message ?? "Failed to update discount");
      } finally {
        setSubmitting(false);
      }
    }
  });

  return { formik, isLoading };
}
