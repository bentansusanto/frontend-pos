import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(2, "Province is required"),
  country: z.string().min(2, "Country is required"),
  postalCode: z
    .string()
    .regex(/^\d{4,10}$/, "Postal code must be 4–10 digits (numbers only)")
    .optional()
    .or(z.literal(""))
});

export const updateSupplierSchema = supplierSchema.partial().extend({
  name: z.string().min(1, "Company name is required")
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
export type UpdateSupplierFormValues = z.infer<typeof updateSupplierSchema>;
