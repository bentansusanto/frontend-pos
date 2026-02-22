"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useResetPasswordForm } from "./hooks";

export const ResetPasswordForm = () => {
  const { formik, isLoading, showPassword, setShowPassword } = useResetPasswordForm();

  return (
    <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="token" className="sr-only">
            Token
          </Label>
          <Input
            id="token"
            name="token"
            type="text"
            required
            className={`w-full ${
              formik.touched.token && formik.errors.token
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }`}
            placeholder="Token"
            value={formik.values.token}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={isLoading || !!formik.initialValues.token} // Disable if token comes from URL
          />
          {formik.touched.token && formik.errors.token && (
            <p className="mt-1 text-xs text-red-500">{formik.errors.token}</p>
          )}
        </div>
        <div>
          <Label htmlFor="password" className="sr-only">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              className={`w-full pr-10 ${
                formik.touched.password && formik.errors.password
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
              placeholder="New Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 focus:outline-none"
              disabled={isLoading}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="mt-1 text-xs text-red-500">{formik.errors.password}</p>
          )}
        </div>
        <div>
          <Label htmlFor="retryPassword" className="sr-only">
            Retry Password
          </Label>
          <div className="relative">
            <Input
              id="retryPassword"
              name="retryPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              className={`w-full pr-10 ${
                formik.touched.retryPassword && formik.errors.retryPassword
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
              placeholder="Confirm New Password"
              value={formik.values.retryPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 focus:outline-none"
              disabled={isLoading}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
            </button>
          </div>
          {formik.touched.retryPassword && formik.errors.retryPassword && (
            <p className="mt-1 text-xs text-red-500">{formik.errors.retryPassword}</p>
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
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </div>

      <div className="text-center text-sm">
        my token expired,{" "}
        <Link href="/forgot-password" className="text-primary hover:text-primary/80 font-medium">
          Resend Reset Code
        </Link>
      </div>
    </form>
  );
};
