import { z } from "zod";

// Schema untuk login Staff / Owner — field 'identifier' bisa berupa email atau username
export const loginEmailSchema = z.object({
  identifier: z.string().min(1, { message: "Email or username is required" }),
  password: z.string().min(1, { message: "Password is required" })
});

// Schema untuk login Kasir (PIN saja)
export const loginPinSchema = z.object({
  pin: z
    .string()
    .min(4, { message: "PIN must be at least 4 digits" })
    .max(8, { message: "PIN cannot exceed 8 digits" })
    .regex(/^\d+$/, { message: "PIN must contain only numbers" })
});

export type LoginEmailSchema = z.infer<typeof loginEmailSchema>;
export type LoginPinSchema = z.infer<typeof loginPinSchema>;

// Legacy export for backward compatibility
export const loginSchema = loginEmailSchema;
export type LoginSchema = LoginEmailSchema;
