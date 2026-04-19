import { z } from "zod";

export const paymentMethod = z.enum(["pix", "cash", "transfer", "other"]);

export const markPaidInputSchema = z.object({
  charge_id: z.string().uuid(),
  paid_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  paid_amount_cents: z.number().int().nonnegative(),
  payment_method: paymentMethod,
});

export type MarkPaidInput = z.infer<typeof markPaidInputSchema>;

export const updateChargeInputSchema = z.object({
  charge_id: z.string().uuid(),
  amount_cents: z.number().int().nonnegative(),
  notes: z
    .string()
    .max(2000)
    .nullable()
    .or(z.literal("").transform(() => null)),
});

export type UpdateChargeInput = z.infer<typeof updateChargeInputSchema>;
