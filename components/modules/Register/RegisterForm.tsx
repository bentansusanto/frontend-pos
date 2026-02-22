"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { UseRegisterForm } from "./hooks";
import { Eye, EyeOff } from "lucide-react";

export const RegisterForm = () => {
  const { formik, isLoading } = UseRegisterForm();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="sr-only">
            Name
          </Label>
          <Input
            id="name"
            type="text"
            required
            className={`w-full ${
              formik.touched.name && formik.errors.name
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }`}
            placeholder="Name"
            {...formik.getFieldProps("name")}
            onBlur={formik.handleBlur}
            disabled={isLoading}
          />
          {formik.touched.name && formik.errors.name && (
            <p className="mt-1 text-sm text-red-500">{formik.errors.name}</p>
          )}
        </div>
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
            disabled={isLoading}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="mt-1 text-sm text-red-500">{formik.errors.email}</p>
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
              autoComplete="new-password"
              required
              className={`w-full pr-10 ${
                formik.touched.password && formik.errors.password
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
              placeholder="Password"
              {...formik.getFieldProps("password")}
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
            <p className="mt-1 text-sm text-red-500">{formik.errors.password}</p>
          )}
        </div>
      </div>

      <div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Loading..." : "Register"}
        </Button>
      </div>
    </form>
  );
};
