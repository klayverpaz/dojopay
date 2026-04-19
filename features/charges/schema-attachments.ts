import { z } from "zod";

export const attachReceiptInputSchema = z.object({
  charge_id: z.string().uuid(),
  attachment_id: z.string().uuid(),
  storage_path: z.string().min(1),
  mime_type: z.string().min(1),
  size_bytes: z.number().int().nonnegative(),
  original_name: z.string().min(1).max(255),
});

export type AttachReceiptInput = z.infer<typeof attachReceiptInputSchema>;
