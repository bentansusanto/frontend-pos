import { z } from "zod";

export const addStockSchema = z.object({
  branchId: z.string().min(1, { message: "Branch is required" }),
  productId: z.string().min(1, { message: "Product is required" }),
  variantId: z.string().optional(),
  stock: z.coerce.number({ invalid_type_error: "stock must be a number" }),
  minStock: z.coerce.number().optional().default(0)
});

export type AddStockValues = z.infer<typeof addStockSchema>;
