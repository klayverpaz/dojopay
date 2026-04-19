"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatBRL } from "@/lib/money";
import { isoToBRDate } from "@/lib/date";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { fillTemplate } from "@/features/charges/services/template";

type Props = {
  template: string;
  clientName: string;
  clientPhone: string | null;
  amountCents: number;
  dueDateISO: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  label?: string;
};

export function WhatsAppButton({
  template,
  clientName,
  clientPhone,
  amountCents,
  dueDateISO,
  variant = "outline",
  size = "sm",
  label = "WhatsApp",
}: Props) {
  const [pending, startTransition] = useTransition();

  function onClick() {
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
    startTransition(async () => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // clipboard write can fail in some browsers without user gesture permission — ignore
      }
      window.open(url, "_blank", "noopener,noreferrer");
      toast.success("Mensagem copiada. Abrindo WhatsApp…");
    });
  }

  return (
    <Button type="button" variant={variant} size={size} disabled={pending} onClick={onClick}>
      {label}
    </Button>
  );
}
