import { z } from "zod";

export const oneOffChargeInputSchema = z.object({
  client_id: z.string().uuid(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amount_cents: z.number().int().nonnegative(),
  notes: z
    .string()
    .max(2000)
    .nullable()
    .or(z.literal("").transform(() => null)),
});

export type OneOffChargeInput = z.infer<typeof oneOffChargeInputSchema>;
