"use client";
import { useLoginMutation } from "@/store/services/auth.service";
import { setCookie } from "@/utils/cookies";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { resetAllApiStates } from "@/store";
import { useAppDispatch } from "@/store/hooks";
import {
  loginEmailSchema,
  LoginEmailSchema,
  loginPinSchema,
  LoginPinSchema
} from "./schema";

export type LoginMode = "staff" | "cashier";

export const HooksLogin = () => {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<LoginMode>("staff");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLoginSuccess = (response: any) => {
    if (response?.data?.token || response?.token) {
      const token = response?.data?.token || response?.token;
      const role = response?.data?.role || response?.role;
      
      setCookie("pos_token", token, { expires: 1 });
      
      // Reset ALL API states to ensure fresh start for the new user
      resetAllApiStates(dispatch);
      
      toast.success("Login berhasil! Mengalihkan...");
      
      setTimeout(() => {
        if (role === "cashier") {
          router.push("/dashboard/pos/new-order");
        } else {
          router.push("/dashboard");
        }
      }, 1000);
    } else {
      toast.error("Login gagal. Token tidak diterima.");
    }
  };

  const handleLoginError = (err: any) => {
    const msgs = err?.data?.Error;
    let errorMessage = "Login gagal. Periksa kredensial Anda.";
    if (Array.isArray(msgs)) {
      errorMessage = msgs.map((e: any) => e.body).join(", ");
    } else if (msgs?.body) {
      errorMessage = msgs.body;
    } else if (err?.data?.message) {
      errorMessage = err.data.message;
    }
    toast.error(errorMessage);
  };

  // Formik untuk mode Staff / Owner (email atau username + password)
  const formikEmail = useFormik<LoginEmailSchema>({
    initialValues: {
      identifier: "",
      password: ""
    },
    validate: (values) => {
      const result = loginEmailSchema.safeParse(values);
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
        // Auto-detect: jika mengandung '@' → kirim sebagai email, selainnya → username
        const isEmail = values.identifier.includes("@");
        const payload = isEmail
          ? { email: values.identifier, password: values.password }
          : { username: values.identifier, password: values.password };

        const response = await login(payload).unwrap();
        handleLoginSuccess(response);
      } catch (err: any) {
        handleLoginError(err);
      }
    }
  });

  // Formik untuk mode Kasir (PIN)
  const formikPin = useFormik<LoginPinSchema>({
    initialValues: {
      pin: ""
    },
    validate: (values) => {
      const result = loginPinSchema.safeParse(values);
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
        const response = await login({ pin: values.pin }).unwrap();
        handleLoginSuccess(response);
      } catch (err: any) {
        handleLoginError(err);
      }
    }
  });

  const handlePinInput = (digit: string) => {
    const currentPin = formikPin.values.pin;
    if (currentPin.length < 8) {
      formikPin.setFieldValue("pin", currentPin + digit);
    }
  };

  const handlePinDelete = () => {
    const currentPin = formikPin.values.pin;
    formikPin.setFieldValue("pin", currentPin.slice(0, -1));
  };

  const handlePinClear = () => {
    formikPin.setFieldValue("pin", "");
  };

  return {
    loginMode,
    setLoginMode,
    isLoading,
    // Staff/Owner mode
    formikEmail,
    showPassword,
    togglePasswordVisibility,
    // Cashier mode
    formikPin,
    handlePinInput,
    handlePinDelete,
    handlePinClear
  };
};
