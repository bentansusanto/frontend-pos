import { useRegisterMutation } from "@/store/services/auth.service";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registerSchema, RegisterSchema } from "./schema";

export const UseRegisterForm = () => {
  const [register, { isLoading }] = useRegisterMutation();
  const router = useRouter();

  const formik = useFormik<RegisterSchema>({
    initialValues: {
      name: "",
      email: "",
      password: ""
    },
    validate: (values) => {
      const result = registerSchema.safeParse(values);
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
        await register(values).unwrap();
        // Save email to localStorage for resend verification
        localStorage.setItem("user_email", values.email);

        toast.success("Registration successful! Redirecting to login...");
        formik.resetForm();
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } catch (err: any) {
        const errorMessage =
          (err as any)?.data?.Error?.body ||
          (err as any)?.data?.message ||
          "Registration failed. Please try again.";
        toast.error(errorMessage);
      }
    }
  });

  return {
    formik,
    isLoading
  };
};
