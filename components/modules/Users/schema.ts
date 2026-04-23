import { z } from "zod";

// Dynamic schema based on role: cashier → pin required, non-cashier → username + password
export const userSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z
      .string()
      .email({ message: "Invalid email address" })
      .min(1, { message: "Email is required" }),
    // password required if not cashier
    password: z.string().optional(),
    // username required if not cashier
    username: z.string().optional(),
    // pin required if cashier
    pin: z
      .string()
      .optional()
      .refine((val) => val === undefined || val === "" || /^\d{6}$/.test(val), {
        message: "PIN must be exactly 6 digits"
      }),
    role_id: z.string().min(1, { message: "Role is required" }),
    // role code needed for conditional validation, not sent to API
    role_code: z.string().optional(),
    branch_id: z.string().optional()
  })
  .superRefine((data, ctx) => {
    const isCashier = data.role_code === "cashier";

    if (isCashier) {
      // Cashier: pin required
      if (!data.pin || data.pin.trim() === "") {
        ctx.addIssue({
          path: ["pin"],
          code: z.ZodIssueCode.custom,
          message: "PIN is required for cashier"
        });
      }
    } else {
      // Non-cashier: username & password required
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
