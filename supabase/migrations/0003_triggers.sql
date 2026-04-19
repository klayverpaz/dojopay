-- Generic updated_at trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

create trigger charges_set_updated_at
  before update on public.charges
  for each row execute function public.set_updated_at();

create trigger settings_set_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

-- Seed settings for each new user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.settings (owner_id, message_template)
  values (new.id,
          'Olá {nome}, tudo bem? Passando para lembrar da mensalidade de {valor} com vencimento em {vencimento}. Qualquer dúvida me avise. Obrigado!');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
