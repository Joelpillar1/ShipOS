-- Tighten notifications INSERT
-- Notifications must only ever be created by the post-for-me webhook, which uses
-- the service-role key (service_role bypasses RLS, so this change does not affect it).
-- The previous "Anyone can insert notifications" policy (with check (true)) also let
-- app users (anon/authenticated) insert notifications for any user_id -- a spoofing
-- vector. Removing it leaves notification creation to the webhook only; users keep
-- SELECT / UPDATE / DELETE on their own rows via the existing policies.

drop policy if exists "Anyone can insert notifications" on public.notifications;
