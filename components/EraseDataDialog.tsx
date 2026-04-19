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
import { toast } from "sonner";
import { eraseMyDataAction } from "@/features/settings/actions";

const CONFIRM_PHRASE = "APAGAR";

export function EraseDataDialog() {
  const [open, setOpen] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    if (phrase !== CONFIRM_PHRASE) {
      toast.error(`Digite ${CONFIRM_PHRASE} para confirmar.`);
      return;
    }
    startTransition(async () => {
      const result = await eraseMyDataAction();
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          Apagar meus dados
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apagar todos os dados?</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p>
            Isto vai remover permanentemente todos os seus clientes, cobranças, anexos e
            comprovantes enviados. Sua conta de acesso continua ativa, mas sem dados.
          </p>
          <p className="text-muted-foreground">
            Digite <strong>{CONFIRM_PHRASE}</strong> abaixo para confirmar.
          </p>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmação</Label>
            <Input
              id="confirm"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder={CONFIRM_PHRASE}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            disabled={pending || phrase !== CONFIRM_PHRASE}
            onClick={onConfirm}
          >
            {pending ? "Apagando..." : "Apagar tudo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
