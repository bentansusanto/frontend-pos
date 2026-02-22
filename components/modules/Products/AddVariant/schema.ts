import { z } from "zod";

export const addVariantSchema = z.object({
  name_variant: z.string().min(1, { message: "Name variant is required" }),
  price: z.number({ invalid_type_error: "Price must be a number" }).min(0, { message: "Price cannot be negative" }),
  weight: z.number({ invalid_type_error: "Weight must be a number" }).optional(),
  color: z.string().optional(),
  thumbnail: z.string().optional(),
  thumbnailFile: z.any().optional()
});

export type AddVariantSchema = z.infer<typeof addVariantSchema>;
