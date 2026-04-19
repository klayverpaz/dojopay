import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EraseDataDialog } from "@/components/EraseDataDialog";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(app)/actions/sign-out";

export const dynamic = "force-dynamic";

export default async function ContaPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <div className="space-y-1">
        <Link href="/ajustes" className="text-sm text-muted-foreground hover:underline">
          ← Ajustes
        </Link>
        <h1 className="text-2xl font-semibold">Conta</h1>
      </div>

      <dl className="grid grid-cols-2 gap-3 rounded-md border p-4 text-sm">
        <dt className="text-muted-foreground">E-mail</dt>
        <dd>{user.email ?? "—"}</dd>
      </dl>

      <form action={signOut}>
        <Button type="submit" variant="outline" className="w-full">
          Sair
        </Button>
      </form>

      <div className="pt-2">
        <EraseDataDialog />
      </div>
    </section>
  );
}
