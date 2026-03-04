import { z } from "zod";

const discountBaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["percentage", "fixed"], {
    required_error: "Type is required",
    invalid_type_error: "Type must be 'percentage' or 'fixed'"
  }),
  value: z.number({ invalid_type_error: "Value must be a number" }).min(0, "Value must be ≥ 0"),
  // ISO date string — backend receives and converts to Date
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isActive: z.boolean({ required_error: "Active status is required" })
});

export const discountSchema = discountBaseSchema
  .refine(
    (data) => {
      if (data.type === "percentage" && data.value > 100) return false;
      return true;
    },
    { message: "Percentage discount cannot exceed 100%", path: ["value"] }
  )
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: "End date must be after start date",
    path: ["endDate"]
  });

// updateDiscountSchema uses the base ZodObject so .partial() is valid
export const updateDiscountSchema = discountBaseSchema
  .partial()
  .extend({ name: z.string().min(1, "Name is required") });

export type DiscountFormValues = z.infer<typeof discountBaseSchema>;
export type UpdateDiscountFormValues = z.infer<typeof updateDiscountSchema>;
