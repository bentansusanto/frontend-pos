import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, { message: "Name is not empty" }),
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .min(1, { message: "Email is not empty" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/(?=.*[a-z])/, { message: "Password must contain at least one lowercase letter" })
    .regex(/(?=.*[A-Z])/, { message: "Password must contain at least one uppercase letter" })
    .regex(/(?=.*\d)/, { message: "Password must contain at least one number" })
    .regex(/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/, {
      message: "Password must contain at least one special character"
    }),
  role_id: z.string().min(1, { message: "Role is not empty" }),
  branch_id: z.string().optional()
});

export type UserFormValues = z.infer<typeof userSchema>;

export const profileSchema = z.object({
  address: z.string().min(1, { message: "Address is required" }),
  phone: z.string().min(1, { message: "Phone is required" })
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
