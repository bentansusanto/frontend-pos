import { z } from "zod";

export const addProductSchema = z.object({
  product: z.object({
    name_product: z.string().min(1, { message: "Name is required" }),
    category_id: z.string().min(1, { message: "Category is required" }),
    price: z.string().optional(),
    description: z.string().min(1, { message: "Description is required" }),
    thumbnail: z.string().min(1, { message: "Thumbnail is required" }),
    images: z.string().min(1, { message: "image is required" }),
    thumbnailFile: z.any().optional(),
    imageFiles: z.any().optional()
  })
});

export type AddProductSchema = z.infer<typeof addProductSchema>;
