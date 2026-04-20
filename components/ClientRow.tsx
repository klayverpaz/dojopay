import Link from "next/link";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { formatBRL } from "@/lib/money";
import type { Client } from "@/features/clients/types";

const cycleLabel: Record<Client["cycle_kind"], string> = {
  days: "Diário",
  weeks: "Semanal",
  months: "Mensal",
};

export function ClientRow({
  client,
  nextLabel,
  status = "ok",
}: {
  client: Client;
  nextLabel?: string;
  status?: "ok" | "overdue";
}) {
  return (
    <Link
      href={`/clientes/${client.id}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-foreground/20"
    >
      <AvatarInitials name={client.name} size="md" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{client.name}</div>
        <div className="text-[11px] tabular-nums text-muted-foreground">
          {cycleLabel[client.cycle_kind]} · {formatBRL(client.default_amount_cents)}
        </div>
      </div>
      {nextLabel && (
        <div
          className={`text-[11px] font-semibold tabular-nums ${
            status === "overdue" ? "text-danger-text" : "text-muted-foreground"
          }`}
        >
          {nextLabel}
        </div>
      )}
    </Link>
  );
}
