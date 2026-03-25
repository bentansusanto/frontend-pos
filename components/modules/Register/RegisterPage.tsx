"use client";
import { RegisterForm } from "./RegisterForm";
import Link from "next/link";

export const RegisterPage = () => {
  return (
    <div className="flex pb-8 lg:h-screen lg:pb-0">
      {/* Left panel – cover image */}
      <div className="bg-muted hidden w-1/2 lg:block dark:bg-slate-950">
        <img src={`/images/cover.png`} alt="Register visual" className="h-full w-full object-cover" />
      </div>

      {/* Right panel – form */}
      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="w-full max-w-md space-y-2 px-6 py-10">
          <div className="text-center mb-6">
            {/* Owner badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold mb-4 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Akun Owner
            </div>

            <h2 className="text-foreground text-3xl font-bold tracking-tight">Create New Account</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              This page is specifically for registering an <strong>Owner</strong> account.
              <br />
              For staff or cashier access, please contact your owner.
            </p>
          </div>

          <RegisterForm />

          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
