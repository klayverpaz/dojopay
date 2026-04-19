import type { Charge } from "@/features/charges/types";

export function classifyToday<T extends Charge>(
  charges: readonly T[],
  todayISO: string,
): { today: T[]; overdue: T[] } {
  const pending = charges.filter((c) => c.status === "pending");

  const todayBucket = pending
    .filter((c) => c.due_date === todayISO)
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id));

  const overdueBucket = pending
    .filter((c) => c.due_date < todayISO)
    .slice()
    .sort((a, b) =>
      a.due_date === b.due_date ? a.id.localeCompare(b.id) : a.due_date.localeCompare(b.due_date),
    );

  return { today: todayBucket, overdue: overdueBucket };
}
