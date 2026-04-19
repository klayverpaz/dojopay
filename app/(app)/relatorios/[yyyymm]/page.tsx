import Link from "next/link";
import { notFound } from "next/navigation";
import { formatBRL } from "@/lib/money";
import { monthBoundsUTC } from "@/lib/date";
import { listPaidChargesInMonth, mapClientIdsToNames } from "@/features/reports/queries";
import { groupPaidByClient, sumEarnings } from "@/features/reports/services/aggregate";

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

function parseYyyymm(raw: string): { year: number; month: number } | null {
  if (!/^\d{6}$/.test(raw)) return null;
  const year = Number.parseInt(raw.slice(0, 4), 10);
  const month = Number.parseInt(raw.slice(4, 6), 10);
  if (month < 1 || month > 12) return null;
  return { year, month };
}

export default async function RelatorioMesPage({ params }: { params: { yyyymm: string } }) {
  const parsed = parseYyyymm(params.yyyymm);
  if (!parsed) notFound();

  const bounds = monthBoundsUTC(parsed.year, parsed.month);
  const [paid, clientNames] = await Promise.all([
    listPaidChargesInMonth(bounds.start, bounds.endExclusive),
    mapClientIdsToNames(),
  ]);

  const total = sumEarnings(paid);
  const byClient = groupPaidByClient(paid);

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1">
        <Link href="/relatorios" className="text-sm text-muted-foreground hover:underline">
          ← Relatórios
        </Link>
        <h1 className="text-2xl font-semibold">
          {monthLabel[parsed.month - 1]} / {parsed.year}
        </h1>
      </header>

      <div className="rounded-md border p-4">
        <div className="text-sm text-muted-foreground">Total recebido</div>
        <div className="text-2xl font-semibold">{formatBRL(total)}</div>
        <div className="text-xs text-muted-foreground">
          {paid.length} {paid.length === 1 ? "cobrança paga" : "cobranças pagas"}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">Por cliente</h2>
        {byClient.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum pagamento neste mês.</p>
        ) : (
          <div className="space-y-2">
            {byClient.map((b) => (
              <Link
                key={b.client_id}
                href={`/clientes/${b.client_id}`}
                className="flex items-center justify-between rounded-md border p-3 hover:bg-muted"
              >
                <div>
                  <div className="font-medium">
                    {clientNames.get(b.client_id) ?? "Cliente arquivado"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {b.count} {b.count === 1 ? "cobrança" : "cobranças"}
                  </div>
                </div>
                <div className="font-semibold">{formatBRL(b.total_cents)}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
