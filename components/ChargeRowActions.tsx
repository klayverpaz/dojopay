"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatBRL } from "@/lib/money";
import { isoToBRDate } from "@/lib/date";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { fillTemplate } from "@/features/charges/services/template";
import { MarkPaidDialog } from "@/components/MarkPaidDialog";

type Props = {
  chargeId: string;
  amountCents: number;
  dueDateISO: string;
  clientName: string;
  clientPhone: string | null;
  template: string;
};

export function ChargeRowActions({
  chargeId,
  amountCents,
  dueDateISO,
  clientName,
  clientPhone,
  template,
}: Props) {
  const [markPaidOpen, setMarkPaidOpen] = useState(false);

  function onNotify() {
    if (!clientPhone) {
      toast.error("Este cliente não tem telefone cadastrado.");
      return;
    }
    const text = fillTemplate(template, {
      nome: clientName,
      valor: formatBRL(amountCents),
      vencimento: isoToBRDate(dueDateISO),
    });
    const url = buildWhatsAppUrl(clientPhone, text);
    if (!url) {
      toast.error("Telefone inválido.");
      return;
    }
    navigator.clipboard.writeText(text).catch(() => undefined);
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Mensagem copiada. Abrindo WhatsApp…");
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Ações
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setMarkPaidOpen(true)}>Marcar pago</DropdownMenuItem>
          <DropdownMenuItem onSelect={onNotify}>Notificar pelo Whatsapp</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <MarkPaidDialog
        chargeId={chargeId}
        defaultAmountCents={amountCents}
        open={markPaidOpen}
        onOpenChange={setMarkPaidOpen}
        trigger={null}
      />
    </>
  );
}
