import { useLoginMutation } from "@/store/services/auth.service";
import { setCookie } from "@/utils/cookies";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { loginSchema, LoginSchema } from "./schema";

export const HooksLogin = () => {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const formik = useFormik<LoginSchema>({
    initialValues: {
      email: "",
      password: ""
    },
    validate: (values) => {
      const result = loginSchema.safeParse(values);
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
        const response = await login(values).unwrap();

        // Save token to cookie
        if (response?.data?.token) {
          setCookie("pos_token", response.data.token, { expires: 1 }); // Expires in 1 day
          toast.success("Login successful! Redirecting...");

          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        } else {
          toast.error("Login failed. No token received.");
        }
      } catch (err: any) {
        console.error("Login error:", err);
        const errorMessage =
          (err as any)?.data?.Error?.body ||
          (err as any)?.data?.message ||
          "Login failed. Please check your credentials.";
        toast.error(errorMessage);
      }
    }
  });

  return {
    formik,
    isLoading,
    showPassword,
    togglePasswordVisibility
  };
};
