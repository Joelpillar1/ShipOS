-- Performance indexes for the hot "fetch this user's data" read paths.
--
-- Targets the queries that run on virtually every page load / realtime refresh and were
-- hitting sequential scans or an unsorted index + extra sort step. All are additive and
-- idempotent (IF NOT EXISTS); none drop or replace existing indexes.
--
-- Predicates below include the RLS USING clauses, since those become part of the WHERE
-- clause the planner sees:
--   notifications : (auth.uid() = user_id OR user_id IS NULL)
--   studio_queue  : (auth.uid() = user_id OR user_id IS NULL)
--   posts         : (auth.uid() = user_id)
--
-- Note: plain CREATE INDEX briefly locks each table while building. The affected tables are
-- small (pre-launch volumes), so this is sub-second. If these tables ever grow large, rebuild
-- the equivalent indexes with CREATE INDEX CONCURRENTLY (outside a transaction) instead.

-- ── notifications ─────────────────────────────────────────────────────────────
-- NotificationContext loads `select * ... order by created_at desc` scoped to the user
-- via RLS. The table previously had only its primary key, so this was a full seq scan + sort.
create index if not exists idx_notifications_user_created_at
  on public.notifications using btree (user_id, created_at desc);

-- ── studio_queue ──────────────────────────────────────────────────────────────
-- getStudioQueue() fetches `order by created_at desc` filtered by workspace_id
-- (or workspace_id IS NULL for the personal workspace). workspace_id is the selective filter.
create index if not exists idx_studio_queue_workspace_created_at
  on public.studio_queue using btree (workspace_id, created_at desc);

-- Back the user_id FK / RLS predicate (also speeds ON DELETE CASCADE from auth.users).
create index if not exists idx_studio_queue_user_id
  on public.studio_queue using btree (user_id);

-- ── posts ─────────────────────────────────────────────────────────────────────
-- The Drafts / Scheduled / Posted / Calendar lists all run the same shape:
--   where user_id = auth.uid() and status = $1 and workspace_id = $2 order by created_at desc
-- This composite lets Postgres satisfy every equality predicate AND return rows already
-- sorted by created_at, removing the separate sort. Leading on user_id (always present via
-- RLS) makes it usable for both the personal (workspace_id IS NULL) and shared-workspace cases.
create index if not exists idx_posts_user_workspace_status_created_at
  on public.posts using btree (user_id, workspace_id, status, created_at desc);
