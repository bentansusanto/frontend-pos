"use client";
import {
  useResendVerifyAccountMutation,
  useVerifyAccountMutation
} from "@/store/services/auth.service";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const HookVerifyAccount = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("verify_token");

  const [verifyAccount, { isLoading: isVerifying }] = useVerifyAccountMutation();
  const [resendVerifyAccount, { isLoading: isResending }] = useResendVerifyAccountMutation();

  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setVerificationStatus("error");
        setErrorMessage("Invalid verification token.");
        return;
      }

      try {
        await verifyAccount(token).unwrap();
        setVerificationStatus("success");
        toast.success("Account verified successfully!");
      } catch (err: any) {
        console.error("Verification error:", err);
        setVerificationStatus("error");
        const msg =
          (err as any)?.data?.Error?.body || (err as any)?.data?.message || "Verification failed.";
        setErrorMessage(msg);
        toast.error(msg);
      }
    };

    if (token) {
      verify();
    } else {
      setVerificationStatus("error");
      setErrorMessage("No verification token found.");
    }
  }, [token, verifyAccount]);

  const handleResendVerification = async () => {
    const email = localStorage.getItem("user_email");

    if (!email) {
      toast.error("Email not found.");
    }

    try {
      await resendVerifyAccount({ email }).unwrap();
      toast.success("Verification email resent successfully!");
    } catch (err: any) {
      console.error("Resend verification error:", err);
      const msg =
        (err as any)?.data?.Error?.body ||
        (err as any)?.data?.message ||
        "Failed to resend verification email.";
      toast.error(msg);
    }
  };

  return {
    verificationStatus,
    errorMessage,
    isVerifying,
    isResending,
    handleResendVerification,
    router
  };
};
