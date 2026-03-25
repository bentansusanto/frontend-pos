"use client";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const LoginPage = () => {
  return (
    <div className="flex pb-8 lg:h-screen lg:pb-0">
      {/* Left panel – cover image */}
      <div className="bg-muted hidden w-1/2 lg:block dark:bg-slate-950">
        <img src={`/images/cover.png`} alt="Login visual" className="h-full w-full object-cover" />
      </div>

      {/* Right panel – form */}
      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="w-full max-w-md space-y-2 px-6 py-10">
          <div className="text-center mb-6">
            <h2 className="text-foreground text-3xl font-bold tracking-tight">Welcome Back</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Log in to your account to access the dashboard
            </p>
          </div>

          <LoginForm />

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Register as Owner
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
