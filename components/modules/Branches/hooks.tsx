import { useCreateBranchMutation } from "@/store/services/branch.service";
import { useFormik } from "formik";
import { toast } from "sonner";
import { BranchFormValues, branchSchema } from "./schema";

interface UseAddBranchProps {
  onSuccess: () => void;
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
