import Link from "next/link";
import { formatBRL } from "@/lib/money";
import { isoToBRDate } from "@/lib/date";
import type { ChargeWithClient } from "@/features/charges/types";

type Props = {
  charge: ChargeWithClient;
  tone: "today" | "overdue";
  action?: React.ReactNode;
};

export function ChargeRow({ charge, tone, action }: Props) {
  const borderTone = tone === "overdue" ? "border-destructive/40" : "border-border";

  return (
    <div className={`flex items-center justify-between rounded-md border ${borderTone} p-3`}>
      <Link href={`/cobrancas/${charge.id}`} className="flex-1 pr-3">
        <div className="font-medium">{charge.client.name}</div>
        <div className="text-xs text-muted-foreground">Vence em {isoToBRDate(charge.due_date)}</div>
      </Link>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="font-semibold">{formatBRL(charge.amount_cents)}</div>
        </div>
        {action}
      </div>
    </div>
  );
}
