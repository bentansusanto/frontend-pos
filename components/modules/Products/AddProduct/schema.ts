import { z } from "zod";

export const addProductSchema = z.object({
  product: z.object({
    name_product: z.string().min(1, { message: "Name is required" }),
    category_id: z.string().min(1, { message: "Category is required" }),
    price: z.string().optional(),
    description: z.string().min(1, { message: "Description is required" }),
    thumbnail: z.string().min(1, { message: "Thumbnail is required" }),
    images: z.string().optional(),
    thumbnailFile: z.any().optional(),
    imageFiles: z.any().optional(),
    id: z.string().optional()
  }),
  variants: z.array(z.object({
    name_variant: z.string().min(1, { message: "Variant name is required" }),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    price: z.number().min(0),
    cost_price: z.number().min(0).optional(),
  })).min(1, { message: "At least one variant is required" })
});

export type AddProductSchema = z.infer<typeof addProductSchema>;
