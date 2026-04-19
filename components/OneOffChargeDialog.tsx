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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { brlToCents, formatBRL } from "@/lib/money";
import { formatISODate } from "@/lib/date";
import { createOneOffChargeAction } from "@/features/charges/actions";

type Props = {
  clientId: string;
  defaultAmountCents: number;
};

export function OneOffChargeDialog({ clientId, defaultAmountCents }: Props) {
  const [open, setOpen] = useState(false);
  const [dueDate, setDueDate] = useState(formatISODate(new Date()));
  const [amountDisplay, setAmountDisplay] = useState(formatBRL(defaultAmountCents));
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cents = brlToCents(amountDisplay);
    if (cents === null) {
      toast.error("Valor inválido.");
      return;
    }
    startTransition(async () => {
      const result = await createOneOffChargeAction({
        client_id: clientId,
        due_date: dueDate,
        amount_cents: cents,
        notes: notes === "" ? null : notes,
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Cobrança avulsa criada.");
        setOpen(false);
        setNotes("");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Nova cobrança avulsa</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova cobrança avulsa</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="due_date">Vencimento</Label>
            <Input
              id="due_date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              value={amountDisplay}
              onChange={(e) => setAmountDisplay(e.target.value)}
              placeholder="R$ 150,00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
