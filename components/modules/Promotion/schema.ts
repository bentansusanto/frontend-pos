import { z } from "zod";

export const promotionRuleSchema = z.object({
  id: z.string().optional().nullable(),
  conditionType: z.string().min(1, "Condition type is required"),
  conditionValue: z.any().optional().nullable(),
  conditionVariantIds: z.array(z.string()).optional().nullable(),
  conditionCategoryIds: z.array(z.string()).optional().nullable(),
  actionType: z.string().min(1, "Action type is required"),
  actionValue: z.any().optional().nullable(),
  actionVariantIds: z.array(z.string()).optional().nullable(),
  actionCategoryIds: z.array(z.string()).optional().nullable(),
});

export const promotionSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional().nullable(),
  status: z.string().min(1, "Status is required"),
  priority: z.coerce.number().int().min(0).default(0),
  isStackable: z.boolean().default(true),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  branchIds: z.array(z.string()).optional().default([]),
  rules: z.array(promotionRuleSchema).min(1, "At least one rule is required"),
});

export const updatePromotionSchema = promotionSchema;

export type PromotionRuleFormValues = z.infer<typeof promotionRuleSchema>;
export type PromotionFormValues = z.infer<typeof promotionSchema>;
