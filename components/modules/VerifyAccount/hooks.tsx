"use client";
import {
  useResendVerifyAccountMutation,
  useVerifyAccountMutation
} from "@/store/services/auth.service";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export const HookVerifyAccount = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("verify_token");

  const [verifyAccount, { 
    isLoading: isVerifying, 
    isSuccess: verificationSuccess, 
    isError: isVerificationError,
    error: verificationError,
    reset: resetVerify
  }] = useVerifyAccountMutation({
    fixedCacheKey: 'verify-account',
  });

  const [resendVerifyAccount, { isLoading: isResending }] = useResendVerifyAccountMutation();

  useEffect(() => {
    const verify = async () => {
      if (!token) return;

      try {
        await verifyAccount(token).unwrap();
        toast.success("Account verified successfully!");
      } catch (err: any) {
        console.error("Verification error:", err);
        // Only show toast if it's the first time we hit this error
        const msg = (err as any)?.data?.Error?.body || (err as any)?.data?.message || "Verification failed.";
        toast.error(msg);
      }
    };

    // Only trigger if we have a token and haven't tried yet in this cache session
    if (token && !verificationSuccess && !isVerificationError && !isVerifying) {
      verify();
    }
  }, [token, verifyAccount, verificationSuccess, isVerificationError, isVerifying]);

  const handleResendVerification = async () => {
    const email = localStorage.getItem("user_email");

    if (!email) {
      toast.error("Email not found.");
      return;
    }

    try {
      await resendVerifyAccount({ email }).unwrap();
      toast.success("Verification email resent successfully!");
      resetVerify(); // Allow retrying verification after resending
    } catch (err: any) {
      console.error("Resend verification error:", err);
      const msg =
        (err as any)?.data?.Error?.body ||
        (err as any)?.data?.message ||
        "Failed to resend verification email.";
      toast.error(msg);
    }
  };

  // Map RTK error to display message
  const errorMessage = isVerificationError 
    ? (verificationError as any)?.data?.Error?.body || (verificationError as any)?.data?.message || "Verification failed."
    : "";

  return {
    verificationStatus: isVerifying ? "loading" : verificationSuccess ? "success" : isVerificationError ? "error" : "loading",
    errorMessage,
    isVerifying,
    isResending,
    handleResendVerification,
    router
  };
};
