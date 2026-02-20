'use client'
import { useForgotPasswordMutation } from "@/store/services/auth.service";
import { useFormik } from "formik";
import { toast } from "sonner";
import { forgotPasswordSchema, ForgotPasswordSchema } from "./schema";

export const useForgotPasswordForm = () => {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const formik = useFormik<ForgotPasswordSchema>({
    initialValues: {
      email: ""
    },
    validate: (values) => {
      const result = forgotPasswordSchema.safeParse(values);
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
    onSubmit: async (values) => {
      try {
        await forgotPassword(values).unwrap();
        toast.success("Password reset link sent to your email!");
        formik.resetForm();
      } catch (err: any) {
        console.error("Forgot password error:", err);
        const errorMessage =
          (err as any)?.data?.Error?.body ||
          (err as any)?.data?.message ||
          "Failed to send password reset link. Please try again.";
        toast.error(errorMessage);
      }
    }
  });

  return {
    formik,
    isLoading
  };
};
