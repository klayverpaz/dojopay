import type { CycleKind } from "@/features/clients/types";

export interface Settings {
  owner_id: string;
  message_template: string;
  default_cycle_kind: CycleKind;
  default_cycle_every: number;
  currency: string;
  locale: string;
  email_reminders_enabled: boolean;
  daily_reminder_time: string; // "HH:MM:SS"
  daily_reminder_timezone: string;
  notify_only_if_any: boolean;
  updated_at: string;
}
