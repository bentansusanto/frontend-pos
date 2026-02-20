'use client'
import { useResetPasswordMutation } from "@/store/services/auth.service";
import { useFormik } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { resetPasswordSchema, ResetPasswordSchema } from "./schema";

export const useResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);

  // Get verify_token from URL query params
  const verifyToken = searchParams.get("verify_token") || "";

  const formik = useFormik<ResetPasswordSchema>({
    initialValues: {
      token: verifyToken,
      password: "",
      retryPassword: ""
    },
    enableReinitialize: true, // Allow form to update when verifyToken changes
    validate: (values) => {
      const result = resetPasswordSchema.safeParse(values);
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
        await resetPassword({
          token: values.token,
          password: values.password,
          retryPassword: values.retryPassword
        }).unwrap();

        toast.success("Password reset successful! Please login with your new password.");
        formik.resetForm();
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } catch (err: any) {
        console.error("Reset password error:", err);
        const errorMessage =
          (err as any)?.data?.Error?.body ||
          (err as any)?.data?.message ||
          "Failed to reset password. Please try again or check your code.";
        toast.error(errorMessage);
      }
    }
  });

  return {
    formik,
    isLoading,
    showPassword,
    setShowPassword
  };
};
