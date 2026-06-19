-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Workspace-aware RLS for the posts table
-- Goal: Allow workspace members to see and (depending on role) modify posts
--       that belong to their shared workspace, while preserving strict personal-
--       post isolation (workspace_id IS NULL → owner only).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Enable RLS on posts (idempotent)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 2. Drop every existing posts policy so we start clean
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT policyname
    FROM   pg_policies
    WHERE  schemaname = 'public'
      AND  tablename  = 'posts'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.posts', r.policyname);
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper: checks whether the current user is an ACTIVE member of a workspace.
-- Used in multiple policies so defined once as an inlined subquery.
-- ─────────────────────────────────────────────────────────────────────────────

-- 3. SELECT — users may read a post when:
--    a) they own it (personal post: workspace_id IS NULL, user_id = them), OR
--    b) they own it AND it is in a workspace they own (workspace_id NOT NULL)
--    c) they are an active member of the post's workspace (any role)
CREATE POLICY "posts_select"
  ON public.posts
  FOR SELECT
  USING (
    -- Personal post owned by the caller
    ( workspace_id IS NULL AND auth.uid() = user_id )

    OR

    -- Workspace post: caller must be an active member of that workspace
    (
      workspace_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM   public.workspace_members wm
        WHERE  wm.workspace_id = posts.workspace_id
          AND  wm.user_id      = auth.uid()
          AND  wm.status       = 'active'
      )
    )
  );

-- 4. INSERT — anyone may create a post they own (user_id enforced by default).
--    For workspace posts the caller must be an active member with a write role.
CREATE POLICY "posts_insert"
  ON public.posts
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      -- Personal post
      workspace_id IS NULL

      OR

      -- Workspace post: must be active owner / admin / editor
      EXISTS (
        SELECT 1
        FROM   public.workspace_members wm
        WHERE  wm.workspace_id = posts.workspace_id
          AND  wm.user_id      = auth.uid()
          AND  wm.status       = 'active'
          AND  wm.role         IN ('owner', 'admin', 'editor')
      )
    )
  );

-- 5. UPDATE — caller must either own the post outright, or be an active
--    owner / admin / editor in the post's workspace.
CREATE POLICY "posts_update"
  ON public.posts
  FOR UPDATE
  USING (
    -- Direct owner (personal or their own workspace post)
    auth.uid() = user_id

    OR

    -- Workspace write-role member
    (
      workspace_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM   public.workspace_members wm
        WHERE  wm.workspace_id = posts.workspace_id
          AND  wm.user_id      = auth.uid()
          AND  wm.status       = 'active'
          AND  wm.role         IN ('owner', 'admin', 'editor')
      )
    )
  )
  WITH CHECK (
    auth.uid() = user_id

    OR

    (
      workspace_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM   public.workspace_members wm
        WHERE  wm.workspace_id = posts.workspace_id
          AND  wm.user_id      = auth.uid()
          AND  wm.status       = 'active'
          AND  wm.role         IN ('owner', 'admin', 'editor')
      )
    )
  );

-- 6. DELETE — same as UPDATE: direct owner or workspace write-role member.
CREATE POLICY "posts_delete"
  ON public.posts
  FOR DELETE
  USING (
    auth.uid() = user_id

    OR

    (
      workspace_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM   public.workspace_members wm
        WHERE  wm.workspace_id = posts.workspace_id
          AND  wm.user_id      = auth.uid()
          AND  wm.status       = 'active'
          AND  wm.role         IN ('owner', 'admin', 'editor')
      )
    )
  );
