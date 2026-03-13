import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  username: z.string().min(3, "Username minimal 3 karakter").regex(/^\w+$/, "Username hanya boleh huruf, angka, dan underscore"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter")
});

export type RegisterSchema = z.infer<typeof registerSchema>;
