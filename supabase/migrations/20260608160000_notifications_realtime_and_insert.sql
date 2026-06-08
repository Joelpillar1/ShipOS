-- Notifications: enable Realtime delivery + restore a scoped client INSERT policy.
--
-- Why: the app surfaces notifications (toast + chime + bell badge) only through a
-- Supabase Realtime postgres_changes subscription on public.notifications. Without the
-- table being part of the `supabase_realtime` publication, inserted rows are never pushed
-- to the browser, so the user receives no live alerts for any post event.
--
-- Also: migration 20260608150229 dropped the only INSERT policy, which blocked the app
-- from creating its own lifecycle notifications (post submitted / scheduled / deleted).
-- We re-add a *scoped* policy so a signed-in user may insert notifications only for
-- themselves (auth.uid() = user_id) — not a spoofing vector. The webhook uses the
-- service-role key and bypasses RLS, so it is unaffected either way.

-- 1. Realtime: add notifications to the supabase_realtime publication (idempotent).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;

-- Ensure UPDATE/DELETE realtime payloads carry full row data (not just the PK).
alter table public.notifications replica identity full;

-- 2. Scoped INSERT policy: authenticated users may create their own notifications only.
drop policy if exists "Users can insert their own notifications" on public.notifications;
create policy "Users can insert their own notifications" on public.notifications
  as PERMISSIVE
  for INSERT
  to authenticated
  with check (auth.uid() = user_id);
