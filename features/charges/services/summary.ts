import type { Charge } from "@/features/charges/types";

export type MonthSummary = {
  yyyyMm: string;
  receivable: { cents: number; count: number };
  overdue: { cents: number; count: number };
  received: { cents: number; count: number };
};

export function buildMonthSummary(
  charges: readonly Charge[],
  todayISO: string,
  yyyyMm: string,
): MonthSummary {
  const alive = charges.filter((c) => !c.deleted_at);

  const inMonth = (dateISO: string): boolean => dateISO.startsWith(`${yyyyMm}-`);
  const paidAtInMonth = (paidAt: string | null): boolean =>
    !!paidAt && paidAt.startsWith(`${yyyyMm}-`);

  const receivableCharges = alive.filter(
    (c) => c.status === "pending" && inMonth(c.due_date),
  );
  const overdueCharges = alive.filter(
    (c) => c.status === "pending" && c.due_date < todayISO,
  );
  const receivedCharges = alive.filter(
    (c) => c.status === "paid" && paidAtInMonth(c.paid_at),
  );

  const sum = (list: readonly Charge[]) =>
    list.reduce<{ cents: number; count: number }>(
      (acc, x) => {
        const amt = x.paid_amount_cents ?? x.amount_cents;
        return { cents: acc.cents + amt, count: acc.count + 1 };
      },
      { cents: 0, count: 0 },
    );

  return {
    yyyyMm,
    receivable: sum(receivableCharges),
    overdue: sum(overdueCharges),
    received: sum(receivedCharges),
  };
}
