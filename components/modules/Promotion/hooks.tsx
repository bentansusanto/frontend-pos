import {
  useCreatePromotionMutation,
  useDeletePromotionMutation,
  useGetPromotionsQuery,
  useUpdatePromotionMutation
} from "@/store/services/promotion.service";
import { useFormik } from "formik";
import { useState } from "react";
import { toast } from "sonner";
import { promotionSchema, type PromotionFormValues } from "./schema";

// ── Zod → Formik errors helper ─────────────────────────────────────────────────
function zodToFormikErrors(issues: { path: (string | number)[]; message: string }[]) {
  const errors: any = {};
  issues.forEach((issue) => {
    // Check if it's a nested path like rules.0.conditionType
    if (issue.path.length > 1) {
      const field = issue.path[0];
      const index = issue.path[1];
      const subField = issue.path[2];
      
      if (!errors[field]) errors[field] = [];
      if (!errors[field][index]) errors[field][index] = {};
      errors[field][index][subField] = issue.message;
    } else {
      errors[issue.path[0] as string] = issue.message;
    }
  });
  return errors;
}

// ── Convert ISO datetime → "YYYY-MM-DD" for <input type="date"> ───────────────
function toDateInput(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

// ── Status helper ─────────────────────────────────────────────────────────────
export function getPromotionStatus(p: any): {
  label: string;
  className: string;
} {
  const now = new Date();
  const start = new Date(p.startDate);
  const end = new Date(p.endDate);

  if (p.status === "INACTIVE") {
    return {
      label: "Inactive",
      className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
    };
  }

  if (start > now) {
    return {
      label: "Scheduled",
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
    };
  }

  if (end < now) {
    return {
      label: "Expired",
      className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
    };
  }

  return {
    label: "Active",
    className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
  };
}

// ── List + Delete ─────────────────────────────────────────────────────────────
export function usePromotionList() {
  const { data: promotions = [], isLoading, isError, refetch } = useGetPromotionsQuery();
  const [deletePromotion, { isLoading: isDeleting }] = useDeletePromotionMutation();
  const [search, setSearch] = useState("");

  const filtered = promotions.filter(
    (p: any) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete promotion "${name}"?`)) return;
    try {
      await deletePromotion(id).unwrap();
      toast.success(`"${name}" deleted`);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to delete promotion");
    }
  };

  const stats = {
    total: promotions.length,
    active: promotions.filter((p: any) => getPromotionStatus(p).label === "Active").length,
    scheduled: promotions.filter((p: any) => getPromotionStatus(p).label === "Scheduled").length,
    expired: promotions.filter((p: any) => getPromotionStatus(p).label === "Expired").length
  };

  return {
    promotions,
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
interface UseCreatePromotionProps {
  onSuccess: () => void;
}

export function useCreatePromotion({ onSuccess }: UseCreatePromotionProps) {
  const [createPromotion, { isLoading }] = useCreatePromotionMutation();

  const formik = useFormik<PromotionFormValues>({
    initialValues: {
      name: "",
      description: "",
      status: "ACTIVE",
      priority: 0,
      isStackable: true,
      startDate: "",
      endDate: "",
      branchIds: [],
      rules: [
        {
          conditionType: "ALWAYS_TRUE",
          conditionValue: {},
          conditionVariantIds: [],
          conditionCategoryIds: [],
          actionType: "PERCENT_DISCOUNT",
          actionValue: { percentage: 0 },
          actionVariantIds: [],
          actionCategoryIds: []
        }
      ]
    },
    validate: (values) => {
      const result = promotionSchema.safeParse(values);
      if (!result.success) return zodToFormikErrors(result.error.issues);
      return {};
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const payload = promotionSchema.parse(values);
        await createPromotion(payload).unwrap();
        toast.success("Promotion created");
        resetForm();
        onSuccess();
      } catch (err: any) {
        toast.error(err?.data?.message ?? "Failed to create promotion");
      } finally {
        setSubmitting(false);
      }
    }
  });

  return { formik, isLoading };
}

// ── Update ────────────────────────────────────────────────────────────────────
interface UseUpdatePromotionProps {
  onSuccess: () => void;
  initialData: any;
}

export function useUpdatePromotion({ onSuccess, initialData }: UseUpdatePromotionProps) {
  const [updatePromotion, { isLoading }] = useUpdatePromotionMutation();

  const formik = useFormik<PromotionFormValues>({
    initialValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      status: initialData?.status || "ACTIVE",
      priority: initialData?.priority || 0,
      isStackable: initialData?.isStackable ?? true,
      startDate: toDateInput(initialData?.startDate),
      endDate: toDateInput(initialData?.endDate),
      branchIds: (initialData?.branchIds || []).filter(Boolean),
      rules: (initialData?.rules || []).map((r: any) => ({
        id: r.id,
        conditionType: r.conditionType,
        conditionValue: r.conditionValue,
        conditionVariantIds: r.conditionVariantIds || (r.conditionVariants || []).map((v: any) => v.id) || [],
        conditionCategoryIds: r.conditionCategoryIds || (r.conditionCategories || []).map((c: any) => c.id) || [],
        actionType: r.actionType,
        actionValue: r.actionValue,
        actionVariantIds: r.actionVariantIds || (r.actionVariants || []).map((v: any) => v.id) || [],
        actionCategoryIds: r.actionCategoryIds || (r.actionCategories || []).map((c: any) => c.id) || []
      }))
    },
    enableReinitialize: true,
    validate: (values) => {
      const result = promotionSchema.safeParse(values);
      if (!result.success) {
        console.warn("ZOD VALIDATION FAILED for Update:", result.error.issues);
        return zodToFormikErrors(result.error.issues);
      }
      return {};
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const payload = promotionSchema.parse(values);
        await updatePromotion({
          id: initialData.id,
          body: payload
        }).unwrap();
        toast.success("Promotion updated");
        onSuccess();
      } catch (err: any) {
        toast.error(err?.data?.message ?? "Failed to update promotion");
      } finally {
        setSubmitting(false);
      }
    }
  });

  return { formik, isLoading };
}
