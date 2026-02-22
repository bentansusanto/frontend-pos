"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { HooksLogin } from "./hooks";

export const LoginForm = () => {
  const { formik, isLoading, showPassword, togglePasswordVisibility } = HooksLogin();

  return (
    <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="email" className="sr-only">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            className={`w-full ${
              formik.touched.email && formik.errors.email
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }`}
            placeholder="Email address"
            {...formik.getFieldProps("email")}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="mt-1 text-xs text-red-500">{formik.errors.email}</p>
          )}
        </div>
        <div>
          <Label htmlFor="password" className="sr-only">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className={`w-full pr-10 ${
                formik.touched.password && formik.errors.password
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
              placeholder="Password"
              {...formik.getFieldProps("password")}
              onBlur={formik.handleBlur}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 focus:outline-none">
              {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="mt-1 text-xs text-red-500">{formik.errors.password}</p>
          )}
        </div>
        <div className="text-end">
          <Link
            href="/forgot-password"
            className="text-primary hover:text-primary/80 ml-auto inline-block text-sm font-medium">
            Forgot your password?
          </Link>
        </div>
      </div>

      <div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </div>
    </form>
  );
};
