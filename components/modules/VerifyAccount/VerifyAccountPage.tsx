"use client";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, Loader2Icon, XCircleIcon } from "lucide-react";
import { HookVerifyAccount } from "./hooks";

export const VerifyAccountPage = () => {
  const {
    verificationStatus,
    errorMessage,
    isVerifying,
    isResending,
    handleResendVerification,
    router
  } = HookVerifyAccount();

  return (
    <div className="flex h-screen pb-8 lg:pb-0">
      <div className="bg-muted hidden w-1/2 lg:block dark:bg-slate-950">
        <img
          src={`/images/cover.png`}
          alt="Verify Account Visual"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="w-full max-w-md space-y-8 px-4">
          <div className="text-center">
            <h2 className="text-foreground mt-6 text-3xl font-bold">Verify Account</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Verifying your account to access the dashboard.
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center space-y-6">
            {verificationStatus === "loading" || isVerifying ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2Icon className="text-primary h-16 w-16 animate-spin" />
                <p className="text-foreground text-lg font-medium">Verifying your token...</p>
              </div>
            ) : verificationStatus === "success" ? (
              <div className="flex flex-col items-center space-y-4">
                <CheckCircleIcon className="h-16 w-16 text-emerald-500" />
                <div className="text-center">
                  <h3 className="text-foreground text-xl font-semibold">
                    Verification Successful!
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Your account has been verified. You can now log in to the dashboard.
                  </p>
                </div>
                <Button className="w-full" onClick={() => router.push("/login")}>
                  Go to Login
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <XCircleIcon className="h-16 w-16 text-red-500" />
                <div className="text-center">
                  <h3 className="text-foreground text-xl font-semibold">Verification Failed</h3>
                  <p className="mt-2 text-red-600">{errorMessage}</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    The token may be invalid or expired. You can request a new verification email.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-950"
                  onClick={handleResendVerification}
                  disabled={isResending}>
                  {isResending ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    "Resend Verification Email"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
