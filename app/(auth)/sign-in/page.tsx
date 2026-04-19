"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { signInWithPassword } from "./actions";

export default function SignInPage() {
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    const result = await signInWithPassword(formData);
    setPending(false);
    if (result?.error) toast.error(result.error);
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <h1 className="text-2xl font-semibold">Entrar</h1>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Entrando..." : "Entrar"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Não tem conta?{" "}
        <Link href="/sign-up" className="underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
