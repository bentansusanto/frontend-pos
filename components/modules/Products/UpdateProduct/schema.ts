import { z } from "zod";

export const updateProductSchema = z.object({
  product: z.object({
    name_product: z.string().min(1, { message: "Name is required" }),
    category_id: z.string().min(1, { message: "Category is required" }),
    price: z.string().optional(),
    description: z.string().min(1, { message: "Description is required" }),
    thumbnail: z.string().optional(),
    images: z.string().optional(),
    thumbnailFile: z.any().optional(),
    imageFiles: z.any().optional()
  }),
  variant: z.object({
    productId: z.string().optional(),
    name_variant: z.string().min(1, { message: "Name variant is required" }),
    price: z.string().min(1, { message: "Price is required" }),
    weight: z.string().min(1, { message: "Weight is required" }),
    color: z.string().min(1, { message: "Color is required" }),
    thumbnail: z.string().optional(),
    thumbnailFile: z.any().optional()
  })
});

export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
