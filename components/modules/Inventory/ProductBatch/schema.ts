import { z } from "zod";

export const createBatchSchema = z.object({
  batchNumber: z.string().min(1, "Batch number is required"),
  branchId: z.string().min(1, "Branch is required"),
  productId: z.string().min(1, "Product is required"),
  productVariantId: z.string().min(1, "Variant is required"),
  supplierId: z.string().optional(),
  initialQuantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  costPrice: z.coerce.number().min(0, "Cost price cannot be negative"),
  manufacturingDate: z.date().optional(),
  expiryDate: z.date().min(new Date(), "Expiry date must be in the future"),
  receivedDate: z.date().default(() => new Date()),
  status: z.enum(["active", "expired", "hold", "sold_out"]).default("active"),
});

export type CreateBatchValues = z.infer<typeof createBatchSchema>;
