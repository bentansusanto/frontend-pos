"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useForgotPasswordForm } from "./hooks";

export const ForgotPasswordPage = () => {
  const { formik, isLoading } = useForgotPasswordForm();

  return (
    <div className="flex pb-8 lg:h-screen lg:pb-0">
      <div className="bg-muted hidden w-1/2 lg:block dark:bg-slate-950">
        <img src={`/images/cover.png`} alt="Login visual" className="h-full w-full object-cover" />
      </div>

      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="w-full max-w-md space-y-8 px-4">
          <div className="text-center">
            <h2 className="text-foreground mt-6 text-3xl font-bold">Forgot Password</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="sr-only">
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`w-full ${
                    formik.touched.email && formik.errors.email
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                  placeholder="Email address"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-1 text-xs text-red-500">{formik.errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !formik.isValid || !formik.dirty}>
                {isLoading ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="text-primary hover:text-primary/80 text-sm font-medium">
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
