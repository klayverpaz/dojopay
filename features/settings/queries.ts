import { createClient } from "@/lib/supabase/server";
import type { Settings } from "./types";

export async function getSettings(): Promise<Settings | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("settings").select("*").maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Settings | null) ?? null;
}
