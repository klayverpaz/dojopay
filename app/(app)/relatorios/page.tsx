import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { formatBRL } from "@/lib/money";
import { monthBoundsUTC } from "@/lib/date";
import { listAllPaidCharges } from "@/features/reports/queries";
import { groupPaidByMonth, sumEarnings } from "@/features/reports/services/aggregate";

export const dynamic = "force-dynamic";

const monthLabel = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function labelFor(yyyyMm: string): string {
  const [yearStr, monthStr] = yyyyMm.split("-");
  const monthIdx = Number.parseInt(monthStr ?? "1", 10) - 1;
  return `${monthLabel[monthIdx] ?? monthStr} / ${yearStr}`;
}

export default async function RelatoriosPage() {
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth() + 1;
  const bounds = monthBoundsUTC(currentYear, currentMonth);

  const allPaid = await listAllPaidCharges();
  const months = groupPaidByMonth(allPaid);

  const currentMonthPaid = allPaid.filter(
    (c) =>
      c.paid_at &&
      c.paid_at >= `${bounds.start}T00:00:00+00:00` &&
      c.paid_at < `${bounds.endExclusive}T00:00:00+00:00`,
  );
  const currentMonthTotal = sumEarnings(currentMonthPaid);

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Relatórios</h1>
        <p className="text-sm text-muted-foreground">
          Recebido em {labelFor(`${currentYear}-${String(currentMonth).padStart(2, "0")}`)}
        </p>
      </header>

      <div className="rounded-md border p-4">
        <div className="text-sm text-muted-foreground">Total do mês</div>
        <div className="text-2xl font-semibold">{formatBRL(currentMonthTotal)}</div>
        <div className="text-xs text-muted-foreground">
          {currentMonthPaid.length}{" "}
          {currentMonthPaid.length === 1 ? "cobrança paga" : "cobranças pagas"}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">Histórico</h2>
        {months.length === 0 ? (
          <EmptyState
            title="Sem histórico ainda"
            description="Quando você marcar cobranças como pagas, elas aparecem aqui."
          />
        ) : (
          <div className="space-y-2">
            {months.map((m) => (
              <Link
                key={m.month}
                href={`/relatorios/${m.month.replace("-", "")}`}
                className="flex items-center justify-between rounded-md border p-3 hover:bg-muted"
              >
                <div>
                  <div className="font-medium">{labelFor(m.month)}</div>
                  <div className="text-xs text-muted-foreground">
                    {m.count} {m.count === 1 ? "cobrança" : "cobranças"}
                  </div>
                </div>
                <div className="font-semibold">{formatBRL(m.total_cents)}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
