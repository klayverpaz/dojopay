-- Enums
create type cycle_kind as enum ('days', 'weeks', 'months');
create type charge_status as enum ('pending', 'paid', 'canceled');
create type payment_method as enum ('pix', 'cash', 'transfer', 'other');

-- Clients
create table public.clients (
  id uuid primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone_e164 text,
  default_amount_cents bigint not null check (default_amount_cents >= 0),
  cycle_kind cycle_kind not null,
  cycle_every integer not null check (cycle_every >= 1),
  cycle_anchor_date date not null,
  cycle_end_date date,
  notes text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index clients_owner_id_idx on public.clients(owner_id);

-- Charges
create table public.charges (
  id uuid primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  due_date date not null,
  amount_cents bigint not null check (amount_cents >= 0),
  status charge_status not null default 'pending',
  paid_at timestamptz,
  paid_amount_cents bigint check (paid_amount_cents is null or paid_amount_cents >= 0),
  payment_method payment_method,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index charges_owner_due_idx on public.charges(owner_id, due_date);
create index charges_owner_client_idx on public.charges(owner_id, client_id);
create index charges_owner_status_due_idx on public.charges(owner_id, status, due_date);

-- Attachments
create table public.attachments (
  id uuid primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  charge_id uuid not null references public.charges(id) on delete cascade,
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint,
  original_name text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index attachments_charge_idx on public.attachments(charge_id);

-- Settings (one row per user)
create table public.settings (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  message_template text not null,
  default_cycle_kind cycle_kind not null default 'months',
  default_cycle_every integer not null default 1,
  currency text not null default 'BRL',
  locale text not null default 'pt-BR',
  email_reminders_enabled boolean not null default true,
  daily_reminder_time time not null default '09:00',
  daily_reminder_timezone text not null default 'America/Sao_Paulo',
  notify_only_if_any boolean not null default true,
  updated_at timestamptz not null default now()
);
