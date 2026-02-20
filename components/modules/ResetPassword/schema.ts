import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset code is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    retryPassword: z.string().min(6, "Retry Password must be at least 6 characters")
  })
  .refine((data) => data.password === data.retryPassword, {
    message: "Passwords don't match",
    path: ["retryPassword"]
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
