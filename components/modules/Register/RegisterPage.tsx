import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'
import { RegisterForm } from './RegisterForm'

export const RegisterPage = () => {
  return (
    <div className="flex pb-8 lg:h-screen lg:pb-0">
      <div className="bg-muted hidden w-1/2 lg:block dark:bg-slate-950">
        <img src={`/images/cover.png`} alt="Login visual" className="h-full w-full object-cover" />
      </div>

      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="w-full max-w-md space-y-8 px-4">
          <div className="text-center">
            <h2 className="text-foreground mt-6 text-3xl font-bold">Register</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Create a new account to access the dashboard.
            </p>
          </div>

          <RegisterForm />

          <div className="mt-6">
            {/* <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-muted px-2 text-gray-500">or continue with</span>
              </div>
            </div>
            
            ... (omitted commented code)
            */}

            <p className="text-muted-foreground mt-6 text-center text-sm">
              Already have an account?{" "}
              <a href="/login" className="text-primary font-medium">
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
