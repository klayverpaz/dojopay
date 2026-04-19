import type { Charge } from "@/features/charges/types";

function effectiveCents(c: Charge): number {
  return c.paid_amount_cents ?? c.amount_cents;
}

function paidMonthKey(c: Charge): string | null {
  if (!c.paid_at) return null;
  return c.paid_at.slice(0, 7); // "yyyy-mm" from ISO timestamp
}

export function sumEarnings(charges: readonly Charge[]): number {
  return charges
    .filter((c) => c.status === "paid")
    .reduce((total, c) => total + effectiveCents(c), 0);
}

export function groupPaidByMonth(
  charges: readonly Charge[],
): { month: string; total_cents: number; count: number }[] {
  const buckets = new Map<string, { total_cents: number; count: number }>();
  for (const c of charges) {
    if (c.status !== "paid") continue;
    const key = paidMonthKey(c);
    if (!key) continue;
    const existing = buckets.get(key) ?? { total_cents: 0, count: 0 };
    existing.total_cents += effectiveCents(c);
    existing.count += 1;
    buckets.set(key, existing);
  }
  return Array.from(buckets.entries())
    .map(([month, v]) => ({ month, total_cents: v.total_cents, count: v.count }))
    .sort((a, b) => b.month.localeCompare(a.month));
}

export function groupPaidByClient(
  charges: readonly Charge[],
): { client_id: string; total_cents: number; count: number }[] {
  const buckets = new Map<string, { total_cents: number; count: number }>();
  for (const c of charges) {
    if (c.status !== "paid") continue;
    const existing = buckets.get(c.client_id) ?? { total_cents: 0, count: 0 };
    existing.total_cents += effectiveCents(c);
    existing.count += 1;
    buckets.set(c.client_id, existing);
  }
  return Array.from(buckets.entries())
    .map(([client_id, v]) => ({ client_id, total_cents: v.total_cents, count: v.count }))
    .sort((a, b) =>
      b.total_cents === a.total_cents
        ? a.client_id.localeCompare(b.client_id)
        : b.total_cents - a.total_cents,
    );
}
