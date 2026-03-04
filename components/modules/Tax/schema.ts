import { z } from "zod";

export const taxSchema = z.object({
  name: z.string().min(1, "Tax name is required"),
  rate: z
    .number({ invalid_type_error: "Rate must be a number" })
    .min(0, "Rate must be ≥ 0")
    .max(100, "Rate must be ≤ 100"),
  // optional in DTO — backend uses column default (true) if not provided
  is_inclusive: z.boolean().optional(),
  is_active: z.boolean().optional()
});

export const updateTaxSchema = taxSchema.partial().extend({
  name: z.string().min(1, "Tax name is required")
});

export type TaxFormValues = z.infer<typeof taxSchema>;
export type UpdateTaxFormValues = z.infer<typeof updateTaxSchema>;
