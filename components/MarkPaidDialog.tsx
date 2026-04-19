"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { brlToCents, formatBRL } from "@/lib/money";
import { formatISODate } from "@/lib/date";
import { markPaidAction } from "@/features/charges/actions";
import type { PaymentMethod } from "@/features/charges/types";

type Props = {
  chargeId: string;
  defaultAmountCents: number;
  trigger: React.ReactNode;
};

export function MarkPaidDialog({ chargeId, defaultAmountCents, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [paidDate, setPaidDate] = useState(formatISODate(new Date()));
  const [amountDisplay, setAmountDisplay] = useState(formatBRL(defaultAmountCents));
  const [method, setMethod] = useState<PaymentMethod>("pix");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cents = brlToCents(amountDisplay);
    if (cents === null) {
      toast.error("Valor inválido.");
      return;
    }
    startTransition(async () => {
      const result = await markPaidAction({
        charge_id: chargeId,
        paid_date: paidDate,
        paid_amount_cents: cents,
        payment_method: method,
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Cobrança marcada como paga.");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Marcar como pago</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paid_date">Data do pagamento</Label>
            <Input
              id="paid_date"
              type="date"
              value={paidDate}
              onChange={(e) => setPaidDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paid_amount">Valor recebido</Label>
            <Input
              id="paid_amount"
              value={amountDisplay}
              onChange={(e) => setAmountDisplay(e.target.value)}
              placeholder="R$ 150,00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Forma de pagamento</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
                <SelectItem value="transfer">Transferência</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
