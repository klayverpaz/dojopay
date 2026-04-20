import { createClient } from "@/lib/supabase/server";
import type { Attachment, Charge, ChargeWithClient } from "./types";

/**
 * All non-deleted charges for a single client, any status.
 * Used by topUpClientCharges to compute exclude-dates.
 */
export async function listChargesForClient(clientId: string): Promise<Charge[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("charges")
    .select("*")
    .eq("client_id", clientId)
    .is("deleted_at", null)
    .order("due_date", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Charge[];
}

/**
 * Pending charges with due_date <= today, joined with client name + phone.
 * The classifyToday service splits these into today/overdue buckets.
 */
export async function listTodayAndOverdueCharges(todayISO: string): Promise<ChargeWithClient[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("charges")
    .select("*, client:clients!inner(id, name, phone_e164)")
    .eq("status", "pending")
    .lte("due_date", todayISO)
    .is("deleted_at", null)
    .order("due_date", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ChargeWithClient[];
}

export async function getChargeWithClient(id: string): Promise<ChargeWithClient | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("charges")
    .select("*, client:clients!inner(id, name, phone_e164)")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as unknown as ChargeWithClient | null) ?? null;
}

export async function listAttachmentsForCharge(chargeId: string): Promise<Attachment[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("attachments")
    .select("*")
    .eq("charge_id", chargeId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Attachment[];
}

export async function signedUrlForAttachment(storagePath: string): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from("attachments")
    .createSignedUrl(storagePath, 300);
  if (error) return null;
  return data?.signedUrl ?? null;
}

/**
 * Retorna todas as charges relevantes pra computar o resumo mensal:
 * - pendentes com due_date no mês ou antes (pra contar "em atraso" de qualquer mês)
 * - pagas com paid_at no mês
 *
 * O filtro preciso é feito em `buildMonthSummary` (serviço puro, testável).
 */
export async function listMonthSummaryCharges(yyyyMm: string): Promise<Charge[]> {
  const supabase = createClient();
  const monthStart = `${yyyyMm}-01`;
  const monthEnd = `${yyyyMm}-31`;
  const paidFromTs = `${monthStart}T00:00:00+00:00`;
  const paidToTs = `${yyyyMm}-31T23:59:59+00:00`;

  const { data, error } = await supabase
    .from("charges")
    .select("*")
    .is("deleted_at", null)
    .or(
      [
        `and(status.eq.pending,due_date.lte.${monthEnd})`,
        `and(status.eq.paid,paid_at.gte.${paidFromTs},paid_at.lte.${paidToTs})`,
      ].join(","),
    );
  if (error) throw new Error(error.message);
  return (data ?? []) as Charge[];
}

/**
 * Próximas cobranças pendentes, a partir de amanhã (exclusive today).
 * Usado pelo painel lateral do /hoje desktop.
 */
export async function listUpcomingCharges(
  todayISO: string,
  limit = 5,
): Promise<ChargeWithClient[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("charges")
    .select("*, client:clients!inner(id, name, phone_e164)")
    .eq("status", "pending")
    .gt("due_date", todayISO)
    .is("deleted_at", null)
    .order("due_date", { ascending: true })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ChargeWithClient[];
}
