"use client";

import {
  useCreateSupplierMutation,
  useDeleteSupplierMutation,
  useGetSuppliersQuery,
  useUpdateSupplierMutation,
  type Supplier
} from "@/store/services/supplier.service";
import { useFormik } from "formik";
import { useState } from "react";
import { toast } from "sonner";
import { supplierSchema, updateSupplierSchema, type SupplierFormValues } from "./schema";

function zodToFormikErrors(issues: { path: (string | number)[]; message: string }[]) {
  const errors: Record<string, string> = {};
  issues.forEach((issue) => {
    if (issue.path[0]) errors[issue.path[0] as string] = issue.message;
  });
  return errors;
}

// ── List + Delete ─────────────────────────────────────────────────────────────
export function useSupplierList() {
  const { data: suppliers = [], isLoading, isError, refetch } = useGetSuppliersQuery();
  const [deleteSupplier, { isLoading: isDeleting }] = useDeleteSupplierMutation();
  const [search, setSearch] = useState("");

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.city ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteSupplier(id).unwrap();
      toast.success(`"${name}" deleted successfully`);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to delete supplier");
    }
  };

  const stats = {
    total: suppliers.length,
    active: suppliers.filter((s) => (s as any).isActive !== false).length,
    cities: new Set(suppliers.map((s) => s.city).filter(Boolean)).size
  };

  return {
    suppliers,
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
interface UseCreateSupplierProps {
  onSuccess: () => void;
}

export function useCreateSupplier({ onSuccess }: UseCreateSupplierProps) {
  const [createSupplier, { isLoading }] = useCreateSupplierMutation();

  const formik = useFormik<SupplierFormValues>({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      province: "",
      country: "",
      postalCode: ""
    },
    validate: (values) => {
      const result = supplierSchema.safeParse(values);
      if (!result.success) return zodToFormikErrors(result.error.issues);
      return {};
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await createSupplier(values).unwrap();
        toast.success("Supplier created successfully");
        resetForm();
        onSuccess();
      } catch (err: any) {
        toast.error(err?.data?.message ?? "Failed to create supplier");
      } finally {
        setSubmitting(false);
      }
    }
  });

  return { formik, isLoading };
}

// ── Update ────────────────────────────────────────────────────────────────────
interface UseUpdateSupplierProps {
  onSuccess: () => void;
  initialData: Supplier;
}

export function useUpdateSupplier({ onSuccess, initialData }: UseUpdateSupplierProps) {
  const [updateSupplier, { isLoading }] = useUpdateSupplierMutation();

  const formik = useFormik<SupplierFormValues>({
    initialValues: {
      name: initialData.name,
      email: initialData.email,
      phone: initialData.phone ?? "",
      address: initialData.address ?? "",
      city: initialData.city ?? "",
      province: initialData.province ?? "",
      country: initialData.country ?? "",
      postalCode: initialData.postalCode ?? ""
    },
    enableReinitialize: true,
    validate: (values) => {
      const result = updateSupplierSchema.safeParse(values);
      if (!result.success) return zodToFormikErrors(result.error.issues);
      return {};
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await updateSupplier({ id: initialData.id, data: values }).unwrap();
        toast.success("Supplier updated successfully");
        resetForm();
        onSuccess();
      } catch (err: any) {
        toast.error(err?.data?.message ?? "Failed to update supplier");
      } finally {
        setSubmitting(false);
      }
    }
  });

  return { formik, isLoading };
}
