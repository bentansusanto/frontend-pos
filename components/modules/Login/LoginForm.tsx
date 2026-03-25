"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Delete, EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { HooksLogin, LoginMode } from "./hooks";

// ─── PIN Numpad ────────────────────────────────────────────────────────────────
const NUMPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

interface NumpadProps {
  pin: string;
  onDigit: (d: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  error?: string;
}

const PinNumpad = ({ pin, onDigit, onDelete, onSubmit, isLoading, error }: NumpadProps) => {
  const maxDots = 6;
  const dots = Array.from({ length: maxDots });

  return (
    <div className="flex flex-col items-center gap-6 mt-4">
      {/* PIN display dots */}
      <div className="flex gap-3">
        {dots.map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-4 h-4 rounded-full border-2 transition-all duration-150",
              pin.length > i
                ? "bg-primary border-primary scale-110"
                : "bg-transparent border-muted-foreground/30"
            )}
          />
        ))}
      </div>
      {error && <p className="text-xs text-red-500 -mt-2">{error}</p>}

      {/* Numpad grid */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
        {NUMPAD_KEYS.map((key, i) => {
          if (key === "") {
            return <div key={i} />;
          }
          if (key === "del") {
            return (
              <button
                key={i}
                type="button"
                onClick={onDelete}
                className="flex items-center justify-center h-14 rounded-xl bg-muted hover:bg-muted/70 active:scale-95 transition-all duration-100 text-muted-foreground"
              >
                <Delete className="w-5 h-5" />
              </button>
            );
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => onDigit(key)}
              className="flex items-center justify-center h-14 rounded-xl bg-muted hover:bg-primary/10 active:bg-primary/20 active:scale-95 transition-all duration-100 text-foreground font-semibold text-xl"
            >
              {key}
            </button>
          );
        })}
      </div>

      {/* Submit button */}
      <Button
        type="button"
        className="w-full max-w-[280px]"
        disabled={isLoading || pin.length < 4}
        onClick={onSubmit}
      >
        {isLoading ? (
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Logging in...
          </>
        ) : (
          "Login as Cashier"
        )}
      </Button>
    </div>
  );
};

// ─── Mode Tab ──────────────────────────────────────────────────────────────────
interface TabProps {
  active: LoginMode;
  onChange: (mode: LoginMode) => void;
}

const ModeTab = ({ active, onChange }: TabProps) => (
  <div className="flex rounded-xl bg-muted p-1 gap-1">
    {(
      [
        { key: "staff", label: "Staff / Owner" },
        { key: "cashier", label: "Cashier" }
      ] as { key: LoginMode; label: string }[]
    ).map(({ key, label }) => (
      <button
        key={key}
        type="button"
        onClick={() => onChange(key)}
        className={cn(
          "flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200",
          active === key
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {label}
      </button>
    ))}
  </div>
);

// ─── Main Form ─────────────────────────────────────────────────────────────────
export const LoginForm = () => {
  const {
    loginMode,
    setLoginMode,
    isLoading,
    formikEmail,
    showPassword,
    togglePasswordVisibility,
    formikPin,
    handlePinInput,
    handlePinDelete
  } = HooksLogin();

  return (
    <div className="mt-6 space-y-5">
      {/* Mode Toggle */}
      <ModeTab active={loginMode} onChange={setLoginMode} />

      {/* ── Staff / Owner Mode ── */}
      {loginMode === "staff" && (
        <form className="space-y-4" onSubmit={formikEmail.handleSubmit}>
          <div>
            <Label htmlFor="identifier" className="mb-1.5 block text-sm font-medium">
              Email / Username
            </Label>
            <Input
              id="identifier"
              type="text"
              autoComplete="username"
              className={`w-full ${
                formikEmail.touched.identifier && formikEmail.errors.identifier
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
              placeholder="your email or username"
              {...formikEmail.getFieldProps("identifier")}
              onBlur={formikEmail.handleBlur}
            />
            {formikEmail.touched.identifier && formikEmail.errors.identifier && (
              <p className="mt-1 text-xs text-red-500">{formikEmail.errors.identifier}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className={`w-full pr-10 ${
                  formikEmail.touched.password && formikEmail.errors.password
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
                placeholder="••••••••"
                {...formikEmail.getFieldProps("password")}
                onBlur={formikEmail.handleBlur}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 focus:outline-none"
              >
                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
            {formikEmail.touched.password && formikEmail.errors.password && (
              <p className="mt-1 text-xs text-red-500">{formikEmail.errors.password}</p>
            )}
          </div>

          <div className="text-end">
            <Link
              href="/forgot-password"
              className="text-primary hover:text-primary/80 inline-block text-sm font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      )}

      {/* ── Cashier / PIN Mode ── */}
      {loginMode === "cashier" && (
        <form onSubmit={formikPin.handleSubmit}>
          <p className="text-center text-sm text-muted-foreground mb-2">
            Enter your cashier PIN
          </p>
          <PinNumpad
            pin={formikPin.values.pin}
            onDigit={handlePinInput}
            onDelete={handlePinDelete}
            onSubmit={() => formikPin.handleSubmit()}
            isLoading={isLoading}
            error={formikPin.touched.pin ? formikPin.errors.pin : undefined}
          />
        </form>
      )}
    </div>
  );
};
