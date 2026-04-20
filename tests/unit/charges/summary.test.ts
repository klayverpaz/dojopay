import { describe, it, expect } from "vitest";
import { buildMonthSummary } from "@/features/charges/services/summary";
import type { Charge } from "@/features/charges/types";

const base: Omit<Charge, "id" | "due_date" | "status" | "paid_at" | "amount_cents"> = {
  owner_id: "u1",
  client_id: "c1",
  notes: null,
  paid_amount_cents: null,
  payment_method: null,
  created_at: "2026-04-01T00:00:00+00:00",
  updated_at: "2026-04-01T00:00:00+00:00",
  deleted_at: null,
} as unknown as Charge;

function c(id: string, dueDate: string, status: Charge["status"], amount: number, paidAt?: string): Charge {
  return {
    ...base,
    id,
    due_date: dueDate,
    status,
    amount_cents: amount,
    paid_at: paidAt ?? null,
  } as unknown as Charge;
}

describe("buildMonthSummary", () => {
  const today = "2026-04-20";
  const yyyyMm = "2026-04";

  it("soma pendentes com due_date no mês", () => {
    const s = buildMonthSummary(
      [c("1", "2026-04-15", "pending", 10000), c("2", "2026-04-25", "pending", 20000)],
      today,
      yyyyMm,
    );
    expect(s.receivable.cents).toBe(30000);
    expect(s.receivable.count).toBe(2);
  });

  it("conta em atraso como pendentes com due_date < today (qualquer mês)", () => {
    const s = buildMonthSummary(
      [
        c("1", "2026-03-10", "pending", 10000),
        c("2", "2026-04-15", "pending", 20000),
        c("3", "2026-04-25", "pending", 30000),
      ],
      today,
      yyyyMm,
    );
    expect(s.overdue.cents).toBe(30000);
    expect(s.overdue.count).toBe(2);
  });

  it("soma pagos com paid_at no mês", () => {
    const s = buildMonthSummary(
      [
        c("1", "2026-04-05", "paid", 10000, "2026-04-05T12:00:00+00:00"),
        c("2", "2026-03-15", "paid", 20000, "2026-04-02T12:00:00+00:00"),
        c("3", "2026-04-05", "paid", 30000, "2026-03-30T12:00:00+00:00"),
      ],
      today,
      yyyyMm,
    );
    expect(s.received.cents).toBe(30000);
    expect(s.received.count).toBe(2);
  });

  it("ignora canceladas e deletadas", () => {
    const s = buildMonthSummary(
      [
        c("1", "2026-04-15", "canceled", 10000),
        { ...c("2", "2026-04-15", "pending", 20000), deleted_at: "2026-04-10T00:00:00+00:00" } as Charge,
      ],
      today,
      yyyyMm,
    );
    expect(s.receivable.cents).toBe(0);
    expect(s.overdue.cents).toBe(0);
    expect(s.received.cents).toBe(0);
  });

  it("retorna zero quando não há charges", () => {
    const s = buildMonthSummary([], today, yyyyMm);
    expect(s).toEqual({
      yyyyMm,
      receivable: { cents: 0, count: 0 },
      overdue: { cents: 0, count: 0 },
      received: { cents: 0, count: 0 },
    });
  });
});
