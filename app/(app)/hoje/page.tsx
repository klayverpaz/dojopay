import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChargeRow } from "@/components/ChargeRow";
import { EmptyState } from "@/components/EmptyState";
import { MarkPaidDialog } from "@/components/MarkPaidDialog";
import { formatBRL } from "@/lib/money";
import { formatISODate, isoToBRDate } from "@/lib/date";
import { listTodayAndOverdueCharges } from "@/features/charges/queries";
import { classifyToday } from "@/features/charges/services/classify";
import { topUpAllClients } from "@/features/charges/actions";

export const dynamic = "force-dynamic";

export default async function HojePage() {
  await topUpAllClients();

  const todayISO = formatISODate(new Date());
  const rows = await listTodayAndOverdueCharges(todayISO);
  const { today, overdue } = classifyToday(rows, todayISO);

  const todayTotal = today.reduce((s, c) => s + c.amount_cents, 0);
  const overdueTotal = overdue.reduce((s, c) => s + c.amount_cents, 0);

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Hoje</h1>
        <p className="text-sm text-muted-foreground">{isoToBRDate(todayISO)}</p>
      </header>

      <div className="rounded-md border p-4">
        <div className="text-sm text-muted-foreground">A receber hoje</div>
        <div className="text-2xl font-semibold">{formatBRL(todayTotal)}</div>
        <div className="text-xs text-muted-foreground">
          {today.length} {today.length === 1 ? "cobrança" : "cobranças"}
        </div>
        {overdue.length > 0 && (
          <div className="mt-3 border-t pt-3 text-sm text-destructive">
            Em atraso: {formatBRL(overdueTotal)} ({overdue.length}{" "}
            {overdue.length === 1 ? "cobrança" : "cobranças"})
          </div>
        )}
      </div>

      {overdue.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground">Em atraso</h2>
          {overdue.map((charge) => (
            <ChargeRow
              key={charge.id}
              charge={charge}
              tone="overdue"
              action={
                <MarkPaidDialog
                  chargeId={charge.id}
                  defaultAmountCents={charge.amount_cents}
                  trigger={
                    <Button size="sm" variant="outline">
                      Pago
                    </Button>
                  }
                />
              }
            />
          ))}
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">Hoje</h2>
        {today.length === 0 && overdue.length === 0 ? (
          <EmptyState
            title="Nada para hoje"
            description="Quando uma cobrança vencer, ela aparece aqui."
            action={
              <Button asChild variant="outline">
                <Link href="/clientes">Ver clientes</Link>
              </Button>
            }
          />
        ) : today.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma cobrança vence hoje.</p>
        ) : (
          today.map((charge) => (
            <ChargeRow
              key={charge.id}
              charge={charge}
              tone="today"
              action={
                <MarkPaidDialog
                  chargeId={charge.id}
                  defaultAmountCents={charge.amount_cents}
                  trigger={
                    <Button size="sm" variant="outline">
                      Pago
                    </Button>
                  }
                />
              }
            />
          ))
        )}
      </div>
    </section>
  );
}
