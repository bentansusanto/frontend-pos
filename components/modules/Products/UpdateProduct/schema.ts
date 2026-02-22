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
  })
});

export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
