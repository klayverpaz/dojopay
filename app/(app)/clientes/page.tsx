import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ClientRow } from "@/components/ClientRow";
import { EmptyState } from "@/components/EmptyState";
import { createClient } from "@/lib/supabase/server";
import { listClients } from "@/features/clients/queries";
import { canAddClient } from "@/features/billing/gate";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const [clients, allowedToAdd] = await Promise.all([listClients(), canAddClient(user.id)]);

  const addButton = allowedToAdd ? (
    <Button asChild>
      <Link href="/clientes/novo">Adicionar</Link>
    </Button>
  ) : (
    <Button disabled>Limite atingido</Button>
  );

  const emptyAction = allowedToAdd ? (
    <Button asChild>
      <Link href="/clientes/novo">Adicionar cliente</Link>
    </Button>
  ) : null;

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        {addButton}
      </div>

      {clients.length === 0 ? (
        <EmptyState
          title="Nenhum cliente ainda"
          description="Adicione seu primeiro cliente para começar."
          action={emptyAction ?? undefined}
        />
      ) : (
        <div className="space-y-2">
          {clients.map((c) => (
            <ClientRow key={c.id} client={c} />
          ))}
        </div>
      )}
    </section>
  );
}
