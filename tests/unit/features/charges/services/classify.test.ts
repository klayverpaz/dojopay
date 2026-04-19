import { describe, expect, it } from "vitest";
import { classifyToday } from "@/features/charges/services/classify";
import type { Charge } from "@/features/charges/types";

function c(partial: Partial<Charge> & { due_date: string; status: Charge["status"] }): Charge {
  return {
    id: "id",
    owner_id: "o",
    client_id: "c",
    amount_cents: 0,
    paid_at: null,
    paid_amount_cents: null,
    payment_method: null,
    notes: null,
    created_at: "2026-04-19T00:00:00Z",
    updated_at: "2026-04-19T00:00:00Z",
    deleted_at: null,
    ...partial,
  };
}

describe("classifyToday", () => {
  const today = "2026-04-19";

  it("splits pending charges into today and overdue buckets", () => {
    const charges = [
      c({ id: "1", due_date: "2026-04-19", status: "pending" }),
      c({ id: "2", due_date: "2026-04-01", status: "pending" }),
      c({ id: "3", due_date: "2026-04-18", status: "pending" }),
      c({ id: "4", due_date: "2026-04-20", status: "pending" }), // upcoming — excluded
    ];
    const result = classifyToday(charges, today);
    expect(result.today.map((x) => x.id)).toEqual(["1"]);
    expect(result.overdue.map((x) => x.id)).toEqual(["2", "3"]);
  });

  it("excludes paid and canceled charges from both buckets", () => {
    const charges = [
      c({ id: "1", due_date: "2026-04-19", status: "paid" }),
      c({ id: "2", due_date: "2026-04-18", status: "canceled" }),
      c({ id: "3", due_date: "2026-04-19", status: "pending" }),
    ];
    const result = classifyToday(charges, today);
    expect(result.today.map((x) => x.id)).toEqual(["3"]);
    expect(result.overdue).toEqual([]);
  });

  it("sorts overdue oldest-first and today by id for stability", () => {
    const charges = [
      c({ id: "b", due_date: "2026-04-19", status: "pending" }),
      c({ id: "a", due_date: "2026-04-19", status: "pending" }),
      c({ id: "x", due_date: "2026-04-01", status: "pending" }),
      c({ id: "y", due_date: "2026-04-15", status: "pending" }),
    ];
    const result = classifyToday(charges, today);
    expect(result.overdue.map((x) => x.due_date)).toEqual(["2026-04-01", "2026-04-15"]);
    expect(result.today.map((x) => x.id)).toEqual(["a", "b"]);
  });

  it("returns empty arrays when no pending charges match", () => {
    const result = classifyToday([], today);
    expect(result).toEqual({ today: [], overdue: [] });
  });
});
