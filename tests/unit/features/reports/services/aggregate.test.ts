import { describe, expect, it } from "vitest";
import {
  sumEarnings,
  groupPaidByMonth,
  groupPaidByClient,
} from "@/features/reports/services/aggregate";
import type { Charge } from "@/features/charges/types";

function c(
  partial: Partial<Charge> & {
    id: string;
    status: Charge["status"];
    paid_at: string | null;
  },
): Charge {
  return {
    owner_id: "o",
    client_id: "cli-" + partial.id,
    due_date: "2026-01-01",
    amount_cents: 0,
    paid_amount_cents: null,
    payment_method: null,
    notes: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    deleted_at: null,
    ...partial,
  };
}

describe("sumEarnings", () => {
  it("sums paid_amount_cents when present, falls back to amount_cents", () => {
    const rows = [
      c({ id: "1", status: "paid", paid_at: "2026-04-10T12:00:00Z", amount_cents: 10000 }),
      c({
        id: "2",
        status: "paid",
        paid_at: "2026-04-20T12:00:00Z",
        amount_cents: 10000,
        paid_amount_cents: 9000,
      }),
    ];
    expect(sumEarnings(rows)).toBe(19000);
  });

  it("ignores non-paid charges", () => {
    const rows = [
      c({ id: "1", status: "paid", paid_at: "2026-04-10T12:00:00Z", amount_cents: 5000 }),
      c({ id: "2", status: "pending", paid_at: null, amount_cents: 5000 }),
      c({ id: "3", status: "canceled", paid_at: null, amount_cents: 5000 }),
    ];
    expect(sumEarnings(rows)).toBe(5000);
  });

  it("returns 0 for empty input", () => {
    expect(sumEarnings([])).toBe(0);
  });
});

describe("groupPaidByMonth", () => {
  it("groups paid charges by yyyy-mm derived from paid_at", () => {
    const rows = [
      c({ id: "1", status: "paid", paid_at: "2026-03-05T12:00:00Z", amount_cents: 10000 }),
      c({ id: "2", status: "paid", paid_at: "2026-04-15T12:00:00Z", amount_cents: 20000 }),
      c({ id: "3", status: "paid", paid_at: "2026-04-28T12:00:00Z", amount_cents: 15000 }),
      c({ id: "4", status: "pending", paid_at: null, amount_cents: 99 }),
    ];
    const out = groupPaidByMonth(rows);
    expect(out).toEqual([
      { month: "2026-04", total_cents: 35000, count: 2 },
      { month: "2026-03", total_cents: 10000, count: 1 },
    ]);
  });

  it("returns [] when no paid charges", () => {
    expect(groupPaidByMonth([])).toEqual([]);
  });
});

describe("groupPaidByClient", () => {
  it("sums paid charges per client and sorts by total desc", () => {
    const rows = [
      c({
        id: "1",
        status: "paid",
        paid_at: "2026-04-01T12:00:00Z",
        amount_cents: 10000,
        client_id: "a",
      }),
      c({
        id: "2",
        status: "paid",
        paid_at: "2026-04-15T12:00:00Z",
        amount_cents: 20000,
        client_id: "b",
      }),
      c({
        id: "3",
        status: "paid",
        paid_at: "2026-04-28T12:00:00Z",
        amount_cents: 5000,
        client_id: "a",
      }),
    ];
    const out = groupPaidByClient(rows);
    expect(out).toEqual([
      { client_id: "b", total_cents: 20000, count: 1 },
      { client_id: "a", total_cents: 15000, count: 2 },
    ]);
  });
});
