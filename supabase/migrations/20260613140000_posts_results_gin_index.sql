-- GIN index on posts.results for the Post For Me webhook → post matching.
--
-- The webhook (supabase/functions/post-for-me) locates the post a result belongs to with a JSONB
-- containment query:
--     select * from posts where results @> '[{"id": "<post_for_me_id>"}]'
-- Without an index this is a sequential scan of the entire posts table on EVERY incoming webhook,
-- which gets slow as the table grows and is what pushed matching onto a fragile 100-row fallback.
--
-- jsonb_path_ops is the smaller, faster GIN opclass specifically for the @> (containment) operator
-- we use here. This makes the primary lookup an indexed probe so the manual full-scan fallback in
-- the webhook handler is only ever a rare safety net.
create index if not exists idx_posts_results_gin
  on public.posts using gin (results jsonb_path_ops);
