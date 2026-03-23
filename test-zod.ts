import { z } from "zod";

const promotionRuleSchema = z.object({
  id: z.string().optional().nullable(),
  conditionType: z.string().min(1, "Condition type is required"),
  conditionValue: z.any().optional().nullable(),
  conditionTargetIds: z.array(z.string()).optional().nullable(),
  actionType: z.string().min(1, "Action type is required"),
  actionValue: z.any().optional().nullable(),
  actionTargetIds: z.array(z.string()).optional().nullable(),
});

const promotionSchema = z.object({
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

const mockData = {
  name: "Ramadhan Buy 3 $50",
  description: "",
  status: "ACTIVE",
  priority: "10",
  isStackable: true,
  startDate: "2026-03-23",
  endDate: "2026-03-28",
  branchIds: ["123"],
  rules: [
    {
      id: "abc",
      conditionType: "MIN_QTY",
      conditionValue: { minQty: 10 },
      conditionTargetIds: null,
      actionType: "FIXED_PRICE",
      actionValue: { amount: 50 },
      actionTargetIds: null,
      createdAt: "2026-03-23T06:47:11.000Z",
      updatedAt: "2026-03-23T06:47:11.000Z",
      promotionId: "def"
    }
  ]
};

const result = promotionSchema.safeParse(mockData);
if (!result.success) {
  console.log("Validation Failed:", JSON.stringify(result.error.issues, null, 2));
} else {
  console.log("Validation Passed! Payload:", JSON.stringify(result.data, null, 2));
}
