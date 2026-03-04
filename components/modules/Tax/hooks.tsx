"use client";

import {
  useCreateTaxMutation,
  useDeleteTaxMutation,
  useGetTaxesQuery,
  useUpdateTaxMutation,
  type Tax
} from "@/store/services/tax.service";
import { useFormik } from "formik";
import { useState } from "react";
import { toast } from "sonner";
import { taxSchema, updateTaxSchema, type TaxFormValues } from "./schema";

// ── Zod → Formik errors helper ─────────────────────────────────────────────────
function zodToFormikErrors(issues: { path: (string | number)[]; message: string }[]) {
  const errors: Record<string, string> = {};
  issues.forEach((issue) => {
    if (issue.path[0]) errors[issue.path[0] as string] = issue.message;
  });
  return errors;
}

// ── List + Delete ─────────────────────────────────────────────────────────────
export function useTaxList() {
  const { data: taxes = [], isLoading, isError, refetch } = useGetTaxesQuery();
  const [deleteTax, { isLoading: isDeleting }] = useDeleteTaxMutation();
  const [search, setSearch] = useState("");

  const filtered = taxes.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete tax "${name}"?`)) return;
    try {
      await deleteTax(id).unwrap();
      toast.success(`"${name}" deleted`);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to delete tax");
    }
  };

  const stats = {
    total: taxes.length,
    active: taxes.filter((t) => t.is_active).length,
    avgRate:
      taxes.length > 0 ? (taxes.reduce((s, t) => s + t.rate, 0) / taxes.length).toFixed(1) : "0"
  };

  return {
    taxes,
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
interface UseCreateTaxProps {
  onSuccess: () => void;
}

export function useCreateTax({ onSuccess }: UseCreateTaxProps) {
  const [createTax, { isLoading }] = useCreateTaxMutation();

  const formik = useFormik<TaxFormValues>({
    initialValues: {
      name: "",
      rate: 0,
      is_inclusive: false,
      is_active: true
    },
    validate: (values) => {
      const result = taxSchema.safeParse(values);
      if (!result.success) return zodToFormikErrors(result.error.issues);
      return {};
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await createTax(values).unwrap();
        toast.success("Tax created");
        resetForm();
        onSuccess();
      } catch (err: any) {
        toast.error(err?.data?.message ?? "Failed to create tax");
      } finally {
        setSubmitting(false);
      }
    }
  });

  return { formik, isLoading };
}

// ── Update ────────────────────────────────────────────────────────────────────
interface UseUpdateTaxProps {
  onSuccess: () => void;
  initialData: Tax;
}

export function useUpdateTax({ onSuccess, initialData }: UseUpdateTaxProps) {
  const [updateTax, { isLoading }] = useUpdateTaxMutation();

  const formik = useFormik<TaxFormValues>({
    initialValues: {
      name: initialData.name,
      rate: initialData.rate,
      is_inclusive: initialData.is_inclusive,
      is_active: initialData.is_active
    },
    enableReinitialize: true,
    validate: (values) => {
      const result = updateTaxSchema.safeParse(values);
      if (!result.success) return zodToFormikErrors(result.error.issues);
      return {};
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await updateTax({ id: initialData.id, data: values }).unwrap();
        toast.success("Tax updated");
        resetForm();
        onSuccess();
      } catch (err: any) {
        toast.error(err?.data?.message ?? "Failed to update tax");
      } finally {
        setSubmitting(false);
      }
    }
  });

  return { formik, isLoading };
}
