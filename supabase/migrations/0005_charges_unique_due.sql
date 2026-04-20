-- Enforce one charge per (client_id, due_date). In v1 the app never sets
-- deleted_at on charges (cancellation uses status='canceled'), so a full
-- unique constraint is functionally equivalent to a partial one. We keep it
-- non-partial here because PostgREST's upsert / onConflict cannot match a
-- partial index (the WHERE clause isn't expressible via the REST API).
create unique index charges_client_due_unique
  on public.charges (client_id, due_date);
