import { z } from "zod";

export const createOrderItemSchema = z.object({
  variantId: z.string({ invalid_type_error: "Product variant ID must be a string" }).optional(),
  productId: z.string({ invalid_type_error: "Product ID must be a string" }).optional(),
  quantity: z.string({ invalid_type_error: "Quantity must be a string" }),
  price: z.coerce
    .number({ invalid_type_error: "Price must be a number" })
    .refine((value) => Number.isFinite(value), { message: "Price must be a number" })
    .refine((value) => Math.round(value * 100) === value * 100, {
      message: "Price must be a number"
    })
});

export const createOrderSchema = z.object({
  order_id: z.string({ invalid_type_error: "Order ID must be a string" }).optional(),
  branch_id: z.string({ invalid_type_error: "Branch ID must be a string" }).optional(),
  user_id: z.string({ invalid_type_error: "User ID must be a string" }).optional(),
  customer_id: z.string({ invalid_type_error: "Customer ID must be a string" }).optional(),
  items: z.array(createOrderItemSchema).min(1, { message: "Items must be at least 1" }),
  notes: z.string({ invalid_type_error: "Notes must be a string" }).optional()
});

export type CreateOrderValues = z.infer<typeof createOrderSchema>;
