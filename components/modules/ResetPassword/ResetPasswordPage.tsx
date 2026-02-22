import { ResetPasswordForm } from "./ResetPasswordForm";

export const ResetPasswordPage = () => {
  return (
    <div className="flex pb-8 lg:h-screen lg:pb-0">
      <div className="bg-muted hidden w-1/2 lg:block dark:bg-slate-950">
        <img src={`/images/cover.png`} alt="Login visual" className="h-full w-full object-cover" />
      </div>

      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="w-full max-w-md space-y-8 px-4">
          <div className="text-center">
            <h2 className="text-foreground mt-6 text-3xl font-bold">Reset Password</h2>
            <p className="text-muted-foreground mt-2 text-sm">Please enter your new password</p>
          </div>

          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
};
