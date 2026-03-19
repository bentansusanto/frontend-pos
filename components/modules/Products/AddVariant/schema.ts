import { z } from "zod";

export const addVariantSchema = z.object({
  name_variant: z.string().min(1, { message: "Name variant is required" }),
  barcode: z.string().optional(),
  price: z.number({ invalid_type_error: "Price must be a number" }).min(0, { message: "Price cannot be negative" }),
  cost_price: z.number({ invalid_type_error: "Cost Price must be a number" }).min(0, { message: "Cost Price cannot be negative" }).optional(),
  thumbnail: z.string().optional(),
  thumbnailFile: z.any().optional()
});

export type AddVariantSchema = z.infer<typeof addVariantSchema>;
