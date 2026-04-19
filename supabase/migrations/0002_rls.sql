alter table public.clients enable row level security;
alter table public.charges enable row level security;
alter table public.attachments enable row level security;
alter table public.settings enable row level security;

create policy clients_owner_rw on public.clients
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy charges_owner_rw on public.charges
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy attachments_owner_rw on public.attachments
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy settings_owner_rw on public.settings
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
