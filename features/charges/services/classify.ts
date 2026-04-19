import type { Charge } from "@/features/charges/types";

export function classifyToday(
  charges: readonly Charge[],
  todayISO: string,
): { today: Charge[]; overdue: Charge[] } {
  const pending = charges.filter((c) => c.status === "pending");

  const todayBucket = pending
    .filter((c) => c.due_date === todayISO)
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id));

  const overdueBucket = pending
    .filter((c) => c.due_date < todayISO)
    .slice()
    .sort((a, b) => (a.due_date === b.due_date ? a.id.localeCompare(b.id) : a.due_date.localeCompare(b.due_date)));

  return { today: todayBucket, overdue: overdueBucket };
}
