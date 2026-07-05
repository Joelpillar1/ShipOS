-- Slideshow Studio read-path performance.
--
-- Targets getSavedSlideshows() / getSlideshowFolders() which filter by workspace_id
-- (or workspace_id IS NULL for personal), scope to auth.uid() via RLS, and order by
-- created_at. Previously only single-column indexes existed, forcing a bitmap combine
-- + sort on every list load.
--
-- Also adds generated summary columns so the list query can skip transferring the full
-- slides jsonb payload (often megabytes of base64 image data) over the wire.

-- ── Generated summary columns (list view) ─────────────────────────────────────
alter table public.slideshows
  add column if not exists slide_count integer
  generated always as (jsonb_array_length(slides)) stored;

alter table public.slideshows
  add column if not exists preview_slide jsonb
  generated always as (
    case when jsonb_array_length(slides) > 0 then slides -> 0 else null end
  ) stored;

-- ── slideshows ────────────────────────────────────────────────────────────────
-- Matches: where user_id = auth.uid() and workspace_id = $1 order by created_at desc
create index if not exists idx_slideshows_user_workspace_created_at
  on public.slideshows using btree (user_id, workspace_id, created_at desc);

-- Folder sidebar counts / move-to-folder filters within a workspace.
create index if not exists idx_slideshows_user_workspace_folder
  on public.slideshows using btree (user_id, workspace_id, folder_id);

-- ── slideshow_folders ─────────────────────────────────────────────────────────
-- Matches: where user_id = auth.uid() and workspace_id = $1 order by created_at asc
create index if not exists idx_slideshow_folders_user_workspace_created_at
  on public.slideshow_folders using btree (user_id, workspace_id, created_at asc);

create index if not exists idx_slideshow_folders_user_id
  on public.slideshow_folders using btree (user_id);
