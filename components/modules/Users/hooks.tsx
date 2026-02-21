import { useCreateUserMutation } from "@/store/services/user.service";
import { useFormik } from "formik";
import { toast } from "sonner";
import { UserFormValues, userSchema } from "./schema";

interface UseAddUserProps {
  onSuccess: () => void;
}

export const useAddUser = ({ onSuccess }: UseAddUserProps) => {
  const [createUser, { isLoading }] = useCreateUserMutation();

  const formik = useFormik<UserFormValues>({
    initialValues: {
      name: "",
      email: "",
      password: "",
      role_id: "",
      branch_id: ""
    },
    validate: (values) => {
      const result = userSchema.safeParse(values);
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
        await createUser(values).unwrap();
        toast.success("User created successfully");
        resetForm();
        onSuccess();
      } catch (error: any) {
        console.error("Failed to create user:", error);
        toast.error(error?.data?.message || "Failed to create user");
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
