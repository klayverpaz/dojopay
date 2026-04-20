import Link from "next/link";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatBRL } from "@/lib/money";
import { isoToBRDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { ChargeWithClient } from "@/features/charges/types";

type Props = {
  charge: ChargeWithClient;
  tone: "today" | "overdue" | "paid";
  overdueDays?: number;
  action?: React.ReactNode;
};

export function ChargeRow({ charge, tone, overdueDays, action }: Props) {
  const overdue = tone === "overdue";
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-card p-3",
        overdue && "border-l-[3px] border-l-destructive",
      )}
    >
      <AvatarInitials name={charge.client.name} size="md" />
      <Link href={`/cobrancas/${charge.id}`} className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold">{charge.client.name}</span>
          {tone === "today" && <StatusBadge variant="today">Hoje</StatusBadge>}
          {tone === "overdue" && (
            <StatusBadge variant="overdue">
              {overdueDays && overdueDays > 0 ? `${overdueDays}d` : "Atraso"}
            </StatusBadge>
          )}
          {tone === "paid" && <StatusBadge variant="paid">Pago</StatusBadge>}
        </div>
        <div className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
          Vence {isoToBRDate(charge.due_date)}
        </div>
      </Link>
      <div className="text-right text-sm font-bold tabular-nums">
        {formatBRL(charge.amount_cents)}
      </div>
      {action && <div className="ml-1">{action}</div>}
    </div>
  );
}
