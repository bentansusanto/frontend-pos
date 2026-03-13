import { z } from "zod";

// Schema untuk login Staff / Owner — field 'identifier' bisa berupa email atau username
export const loginEmailSchema = z.object({
  identifier: z.string().min(1, { message: "Email atau username wajib diisi" }),
  password: z.string().min(1, { message: "Password wajib diisi" })
});

// Schema untuk login Kasir (PIN saja)
export const loginPinSchema = z.object({
  pin: z
    .string()
    .min(4, { message: "PIN minimal 4 digit" })
    .max(8, { message: "PIN maksimal 8 digit" })
    .regex(/^\d+$/, { message: "PIN hanya boleh angka" })
});

export type LoginEmailSchema = z.infer<typeof loginEmailSchema>;
export type LoginPinSchema = z.infer<typeof loginPinSchema>;

// Legacy export for backward compatibility
export const loginSchema = loginEmailSchema;
export type LoginSchema = LoginEmailSchema;
