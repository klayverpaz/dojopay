import { ClientForm } from "@/components/ClientForm";
import { createClientAction } from "@/features/clients/actions";

export default function NovoClientePage() {
  return (
    <section className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold">Novo cliente</h1>
      <ClientForm onSubmit={createClientAction} submitLabel="Criar" />
    </section>
  );
}
