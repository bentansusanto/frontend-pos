"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { UseRegisterForm } from "./hooks";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export const RegisterForm = () => {
  const { formik, isLoading } = UseRegisterForm();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="space-y-4" onSubmit={formik.handleSubmit}>
      {/* Name */}
      <div>
        <Label htmlFor="name" className="mb-1.5 block text-sm font-medium">
          Nama Lengkap
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
          placeholder="Nama Anda"
          {...formik.getFieldProps("name")}
          onBlur={formik.handleBlur}
          disabled={isLoading}
        />
        {formik.touched.name && formik.errors.name && (
          <p className="mt-1 text-xs text-red-500">{formik.errors.name}</p>
        )}
      </div>

      {/* Username */}
      <div>
        <Label htmlFor="username" className="mb-1.5 block text-sm font-medium">
          Username
        </Label>
        <Input
          id="username"
          type="text"
          autoComplete="username"
          required
          className={`w-full ${
            formik.touched.username && formik.errors.username
              ? "border-red-500 focus-visible:ring-red-500"
              : ""
          }`}
          placeholder="contoh: john_owner"
          {...formik.getFieldProps("username")}
          onBlur={formik.handleBlur}
          disabled={isLoading}
        />
        {formik.touched.username && formik.errors.username && (
          <p className="mt-1 text-xs text-red-500">{formik.errors.username}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
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
          placeholder="your@email.com"
          {...formik.getFieldProps("email")}
          onBlur={formik.handleBlur}
          disabled={isLoading}
        />
        {formik.touched.email && formik.errors.email && (
          <p className="mt-1 text-xs text-red-500">{formik.errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <Label htmlFor="password" className="mb-1.5 block text-sm font-medium">
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
            placeholder="••••••••"
            {...formik.getFieldProps("password")}
            onBlur={formik.handleBlur}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 focus:outline-none"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="sr-only">{showPassword ? "Sembunyikan password" : "Tampilkan password"}</span>
          </button>
        </div>
        {formik.touched.password && formik.errors.password && (
          <p className="mt-1 text-xs text-red-500">{formik.errors.password}</p>
        )}
      </div>

      {/* Submit */}
      <div className="pt-2">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mendaftarkan...
            </>
          ) : (
            "Daftar sebagai Owner"
          )}
        </Button>
      </div>

      {/* Info note */}
      <p className="text-center text-xs text-muted-foreground pt-1">
        Setelah mendaftar, cek email Anda untuk verifikasi akun.
      </p>
    </form>
  );
};
