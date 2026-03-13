import { z } from "zod";

// Schema dinamis berdasarkan role: cashier → pin required, non-cashier → username + password
export const userSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z
      .string()
      .email({ message: "Invalid email address" })
      .min(1, { message: "Email is required" }),
    // password wajib jika bukan cashier
    password: z.string().optional(),
    // username wajib jika bukan cashier
    username: z.string().optional(),
    // pin wajib jika cashier
    pin: z
      .string()
      .optional()
      .refine((val) => val === undefined || val === "" || /^\d{4,8}$/.test(val), {
        message: "PIN must be 4-8 digits"
      }),
    role_id: z.string().min(1, { message: "Role is required" }),
    // code role dibutuhkan untuk validasi kondisional, tidak dikirim ke API
    role_code: z.string().optional(),
    branch_id: z.string().optional()
  })
  .superRefine((data, ctx) => {
    const isCashier = data.role_code === "cashier";

    if (isCashier) {
      // Kasir: pin wajib
      if (!data.pin || data.pin.trim() === "") {
        ctx.addIssue({
          path: ["pin"],
          code: z.ZodIssueCode.custom,
          message: "PIN wajib diisi untuk kasir"
        });
      }
    } else {
      // Non-kasir: username & password wajib
      if (!data.username || data.username.trim() === "") {
        ctx.addIssue({
          path: ["username"],
          code: z.ZodIssueCode.custom,
          message: "Username is required"
        });
      }
      if (!data.password || data.password.length < 8) {
        ctx.addIssue({
          path: ["password"],
          code: z.ZodIssueCode.custom,
          message: "Password must be at least 8 characters long"
        });
      } else {
        if (!/(?=.*[a-z])/.test(data.password)) {
          ctx.addIssue({
            path: ["password"],
            code: z.ZodIssueCode.custom,
            message: "Password must contain at least one lowercase letter"
          });
        }
        if (!/(?=.*[A-Z])/.test(data.password)) {
          ctx.addIssue({
            path: ["password"],
            code: z.ZodIssueCode.custom,
            message: "Password must contain at least one uppercase letter"
          });
        }
        if (!/(?=.*\d)/.test(data.password)) {
          ctx.addIssue({
            path: ["password"],
            code: z.ZodIssueCode.custom,
            message: "Password must contain at least one number"
          });
        }
        if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(data.password)) {
          ctx.addIssue({
            path: ["password"],
            code: z.ZodIssueCode.custom,
            message: "Password must contain at least one special character"
          });
        }
      }
    }
  });

export type UserFormValues = z.infer<typeof userSchema>;

export const profileSchema = z.object({
  address: z.string().min(1, { message: "Address is required" }),
  phone: z.string().min(1, { message: "Phone is required" })
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
