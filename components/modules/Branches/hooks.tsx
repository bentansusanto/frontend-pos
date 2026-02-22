import { useCreateBranchMutation, useUpdateBranchMutation } from "@/store/services/branch.service";
import { useFormik } from "formik";
import { toast } from "sonner";
import { BranchFormValues, branchSchema } from "./schema";

interface UseAddBranchProps {
  onSuccess: () => void;
}

interface UseUpdateBranchProps {
  onSuccess: () => void;
  initialData?: BranchFormValues & { id: string };
}

export const useAddBranch = ({ onSuccess }: UseAddBranchProps) => {
  const [createBranch, { isLoading }] = useCreateBranchMutation();

  const formik = useFormik<BranchFormValues>({
    initialValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
      city: "",
      province: ""
    },
    validate: (values) => {
      const result = branchSchema.safeParse(values);
      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0] as string] = issue.message;
          }
        });
        return errors;
      }
      return {};
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await createBranch(values).unwrap();
        toast.success("Branch created successfully");
        resetForm();
        onSuccess();
      } catch (error: any) {
        console.error("Failed to create branch:", error);
        toast.error(error?.data?.message || "Failed to create branch");
      } finally {
        setSubmitting(false);
      }
    }
  });

  return {
    formik,
    isLoading
  };
};

export const useUpdateBranch = ({ onSuccess, initialData }: UseUpdateBranchProps) => {
  const [updateBranch, { isLoading }] = useUpdateBranchMutation();

  const formik = useFormik<BranchFormValues>({
    initialValues: {
      name: initialData?.name || "",
      address: initialData?.address || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      city: initialData?.city || "",
      province: initialData?.province || ""
    },
    enableReinitialize: true,
    validate: (values) => {
      const result = branchSchema.safeParse(values);
      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0] as string] = issue.message;
          }
        });
        return errors;
      }
      return {};
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      if (!initialData?.id) return;
      
      try {
        await updateBranch({ id: initialData.id, data: values }).unwrap();
        toast.success("Branch updated successfully");
        resetForm();
        onSuccess();
      } catch (error: any) {
        console.error("Failed to update branch:", error);
        toast.error(error?.data?.message || "Failed to update branch");
      } finally {
        setSubmitting(false);
      }
    }
  });

  return {
    formik,
    isLoading
  };
};
