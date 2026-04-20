"use client";

import { useState, useMemo } from "react";
import { FilterPills } from "@/components/ui/filter-pills";
import { ChargeRow } from "@/components/ChargeRow";
import { ChargeRowActions } from "@/components/ChargeRowActions";
import type { ChargeWithClient } from "@/features/charges/types";

type Filter = "all" | "pending" | "overdue" | "paid";

export function HojeFilterPills({
  today,
  overdue,
  paid,
  template,
  todayISO,
}: {
  today: ChargeWithClient[];
  overdue: ChargeWithClient[];
  paid: ChargeWithClient[];
  template: string;
  todayISO: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const counts = {
    all: today.length + overdue.length + paid.length,
    pending: today.length,
    overdue: overdue.length,
    paid: paid.length,
  };

  const showOverdue = filter === "all" || filter === "overdue";
  const showToday = filter === "all" || filter === "pending";
  const showPaid = filter === "all" || filter === "paid";

  const overdueDays = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of overdue) {
      const diff = Math.floor(
        (new Date(todayISO).getTime() - new Date(c.due_date).getTime()) / 86400000,
      );
      map.set(c.id, Math.max(1, diff));
    }
    return map;
  }, [overdue, todayISO]);

  const actionFor = (c: ChargeWithClient) => (
    <ChargeRowActions
      chargeId={c.id}
      amountCents={c.amount_cents}
      dueDateISO={c.due_date}
      clientName={c.client.name}
      clientPhone={c.client.phone_e164}
      template={template}
    />
  );

  return (
    <>
      <FilterPills<Filter>
        options={[
          { value: "all", label: "Todas", count: counts.all },
          { value: "pending", label: "Pendentes", count: counts.pending },
          { value: "overdue", label: "Em atraso", count: counts.overdue },
          { value: "paid", label: "Pagas", count: counts.paid },
        ]}
        value={filter}
        onChange={setFilter}
      />

      {showOverdue && overdue.length > 0 && (
        <div className="space-y-2">
          <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Em atraso
            <span className="rounded-full bg-danger-soft px-1.5 py-0.5 text-[10px] font-bold text-danger-text">
              {overdue.length}
            </span>
          </h2>
          <div className="space-y-2">
            {overdue.map((c) => (
              <ChargeRow
                key={c.id}
                charge={c}
                tone="overdue"
                overdueDays={overdueDays.get(c.id)}
                action={actionFor(c)}
              />
            ))}
          </div>
        </div>
      )}

      {showToday && today.length > 0 && (
        <div className="space-y-2">
          <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Hoje
            <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
              {today.length}
            </span>
          </h2>
          <div className="space-y-2">
            {today.map((c) => (
              <ChargeRow key={c.id} charge={c} tone="today" action={actionFor(c)} />
            ))}
          </div>
        </div>
      )}

      {showPaid && paid.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Pagas hoje
          </h2>
          <div className="space-y-2">
            {paid.map((c) => (
              <ChargeRow key={c.id} charge={c} tone="paid" />
            ))}
          </div>
        </div>
      )}

      {counts.all === 0 && (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Nada para hoje. Quando uma cobrança vencer, ela aparece aqui.
        </p>
      )}
    </>
  );
}
