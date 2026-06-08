-- ShipOS baseline schema (introspected from remote project wrjgmczyhixiqtigucwh)
-- Schemas: public (+ custom objects in auth)

-- ════ EXTENSIONS ════
create extension if not exists "pg_stat_statements" with schema "extensions";
create extension if not exists "pgcrypto" with schema "extensions";
create extension if not exists "supabase_vault" with schema "vault";
create extension if not exists "uuid-ossp" with schema "extensions";

-- ════ TABLES ════
create table public.notifications (
  id uuid default gen_random_uuid() not null,
  user_id uuid,
  title text not null,
  message text not null,
  type text not null,
  unread boolean default true,
  created_at timestamp with time zone default now()
);

create table public.posts (
  id uuid default gen_random_uuid() not null,
  user_id uuid default auth.uid(),
  type text not null,
  content text not null,
  accounts jsonb default '[]'::jsonb not null,
  media jsonb default '[]'::jsonb not null,
  media_previews jsonb default '[]'::jsonb not null,
  status text not null,
  scheduled_date text,
  scheduled_time text,
  posted_at timestamp with time zone,
  stats jsonb default '{"likes": "0", "reach": "0", "shares": "0"}'::jsonb not null,
  progress integer default 100,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  workspace_id uuid,
  post_type text default 'feed'::text,
  results jsonb
);

create table public.profiles (
  id uuid not null,
  name text,
  username text,
  joined_date text default to_char(now(), 'Month YYYY'::text),
  plan text default 'Free'::text,
  updated_at timestamp with time zone default now(),
  ai_credits integer default 100,
  email text,
  avatar_url text
);

create table public.studio_queue (
  id text not null,
  workspace_id text,
  user_id uuid,
  content text not null,
  platform text not null,
  scheduled_date text,
  scheduled_time text,
  media jsonb default '[]'::jsonb not null,
  media_previews jsonb default '[]'::jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.workspace_members (
  id uuid default gen_random_uuid() not null,
  workspace_id uuid not null,
  user_id uuid,
  invited_email text,
  role text default 'viewer'::text not null,
  status text default 'pending'::text not null,
  invited_by uuid,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.workspaces (
  id uuid default gen_random_uuid() not null,
  owner_id uuid not null,
  name text not null,
  logo_url text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- ════ CONSTRAINTS ════
alter table public.notifications add constraint notifications_pkey PRIMARY KEY (id);
alter table public.notifications add constraint notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.notifications add constraint notifications_type_check CHECK ((type = ANY (ARRAY['success'::text, 'failure'::text, 'info'::text])));
alter table public.posts add constraint posts_pkey PRIMARY KEY (id);
alter table public.posts add constraint posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.posts add constraint posts_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL;
alter table public.posts add constraint posts_post_type_check CHECK ((post_type = ANY (ARRAY['feed'::text, 'reel'::text, 'story'::text, 'short'::text])));
alter table public.posts add constraint posts_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'scheduled'::text, 'posted'::text])));
alter table public.posts add constraint posts_type_check CHECK ((type = ANY (ARRAY['text'::text, 'image'::text, 'video'::text])));
alter table public.profiles add constraint profiles_pkey PRIMARY KEY (id);
alter table public.profiles add constraint profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.studio_queue add constraint studio_queue_pkey PRIMARY KEY (id);
alter table public.studio_queue add constraint studio_queue_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.workspace_members add constraint unique_email_per_workspace UNIQUE (workspace_id, invited_email);
alter table public.workspace_members add constraint unique_user_per_workspace UNIQUE (workspace_id, user_id);
alter table public.workspace_members add constraint workspace_members_pkey PRIMARY KEY (id);
alter table public.workspace_members add constraint workspace_members_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id) ON DELETE SET NULL;
alter table public.workspace_members add constraint workspace_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.workspace_members add constraint workspace_members_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
alter table public.workspace_members add constraint member_identity_required CHECK (((user_id IS NOT NULL) OR (invited_email IS NOT NULL)));
alter table public.workspace_members add constraint workspace_members_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'editor'::text, 'viewer'::text])));
alter table public.workspace_members add constraint workspace_members_status_check CHECK ((status = ANY (ARRAY['active'::text, 'pending'::text])));
alter table public.workspaces add constraint workspaces_pkey PRIMARY KEY (id);
alter table public.workspaces add constraint workspaces_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ════ INDEXES ════
CREATE INDEX idx_posts_created_at ON public.posts USING btree (created_at DESC);
CREATE INDEX idx_posts_posted_at ON public.posts USING btree (posted_at DESC);
CREATE INDEX idx_posts_scheduled_date ON public.posts USING btree (scheduled_date);
CREATE INDEX idx_posts_status ON public.posts USING btree (status);
CREATE INDEX idx_posts_type ON public.posts USING btree (type);
CREATE INDEX idx_posts_user_id ON public.posts USING btree (user_id);
CREATE INDEX idx_posts_user_status ON public.posts USING btree (user_id, status);
CREATE INDEX posts_workspace_id_status_created_at_idx ON public.posts USING btree (workspace_id, status, created_at DESC);
CREATE INDEX idx_profiles_email ON public.profiles USING btree (email);
CREATE INDEX idx_profiles_plan ON public.profiles USING btree (plan);
CREATE INDEX idx_profiles_username ON public.profiles USING btree (username);
CREATE INDEX idx_workspace_members_invited_email ON public.workspace_members USING btree (invited_email);
CREATE INDEX idx_workspace_members_role ON public.workspace_members USING btree (role);
CREATE INDEX idx_workspace_members_status ON public.workspace_members USING btree (status);
CREATE INDEX idx_workspace_members_user_id ON public.workspace_members USING btree (user_id);
CREATE INDEX idx_workspace_members_workspace_id ON public.workspace_members USING btree (workspace_id);
CREATE INDEX idx_workspace_members_workspace_role ON public.workspace_members USING btree (workspace_id, role);
CREATE INDEX idx_workspace_members_workspace_status ON public.workspace_members USING btree (workspace_id, status);
CREATE INDEX workspace_members_user_id_idx ON public.workspace_members USING btree (user_id);
CREATE INDEX idx_workspaces_created_at ON public.workspaces USING btree (created_at DESC);
CREATE INDEX idx_workspaces_owner_id ON public.workspaces USING btree (owner_id);
CREATE INDEX workspaces_created_at_idx ON public.workspaces USING btree (created_at);

-- ════ FUNCTIONS (public) ════
CREATE OR REPLACE FUNCTION public.check_policy_exists(policy_name text, table_name text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = table_name 
      AND policyname = policy_name
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_workspace(p_name text, p_color text DEFAULT NULL::text, p_description text DEFAULT NULL::text, p_logo_url text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_workspace_id UUID;
  v_workspace public.workspaces;
BEGIN
  -- Insert only name and logo_url into workspaces
  INSERT INTO public.workspaces (owner_id, name, logo_url)
  VALUES (auth.uid(), p_name, p_logo_url)
  RETURNING id INTO v_workspace_id;

  -- Add creator as Owner in workspace_members with active status
  INSERT INTO public.workspace_members (workspace_id, user_id, role, status)
  VALUES (v_workspace_id, auth.uid(), 'owner', 'active')
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  -- Return the created workspace row as JSON
  SELECT * INTO v_workspace FROM public.workspaces WHERE id = v_workspace_id;

  RETURN row_to_json(v_workspace);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_active_workspaces(user_uuid uuid)
 RETURNS SETOF uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT workspace_id 
  FROM workspace_members 
  WHERE user_id = user_uuid 
    AND status = 'active';
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_workspace_id uuid;
  v_name text;
BEGIN
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- Upsert profile row
  INSERT INTO public.profiles (id, name, username, email)
  VALUES (
    NEW.id,
    v_name,
    COALESCE(NEW.raw_user_meta_data->>'user_name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name  = COALESCE(EXCLUDED.name, profiles.name);

  -- Create default workspace named "Main"
  INSERT INTO public.workspaces (owner_id, name)
  VALUES (NEW.id, 'Main')
  RETURNING id INTO v_workspace_id;

  -- Add user as workspace owner with active status
  INSERT INTO public.workspace_members (workspace_id, user_id, role, status, invited_by)
  VALUES (v_workspace_id, NEW.id, 'owner', 'active', NEW.id);

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_workspace_admin_or_owner(user_uuid uuid, ws_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    from workspace_members 
    WHERE user_id = user_uuid 
      AND workspace_id = ws_id 
      AND status = 'active' 
      AND role IN ('owner', 'admin')
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_workspace_owner(user_uuid uuid, ws_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    from workspace_members 
    WHERE user_id = user_uuid 
      AND workspace_id = ws_id 
      AND status = 'active' 
      AND role = 'owner'
  );
$function$
;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.transfer_workspace_ownership(p_workspace_id uuid, p_new_owner_member_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_new_owner_user_id uuid;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = p_workspace_id
      AND user_id      = auth.uid()
      AND role         = 'owner'
      AND status       = 'active'
  ) THEN
    RAISE EXCEPTION 'Only the workspace owner can transfer ownership';
  END IF;

  SELECT user_id INTO v_new_owner_user_id
  FROM public.workspace_members
  WHERE id = p_new_owner_member_id AND workspace_id = p_workspace_id;

  IF v_new_owner_user_id IS NULL THEN
    RAISE EXCEPTION 'Target member not found or is a pending invite';
  END IF;

  -- Downgrade current owner → admin
  UPDATE public.workspace_members
  SET role = 'admin', updated_at = now()
  WHERE workspace_id = p_workspace_id AND user_id = auth.uid();

  -- Upgrade target → owner
  UPDATE public.workspace_members
  SET role = 'owner', updated_at = now()
  WHERE id = p_new_owner_member_id AND workspace_id = p_workspace_id;

  -- Update workspaces.owner_id reference
  UPDATE public.workspaces
  SET owner_id = v_new_owner_user_id, updated_at = now()
  WHERE id = p_workspace_id;
END;
$function$
;

-- ════ ROW LEVEL SECURITY ════
alter table public.notifications enable row level security;
alter table public.posts enable row level security;
alter table public.profiles enable row level security;
alter table public.studio_queue enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspaces enable row level security;

-- ════ POLICIES ════
create policy "Anyone can insert notifications" on public.notifications
  as PERMISSIVE
  for INSERT
  to public
  with check (true);

create policy "Users can delete their own notifications" on public.notifications
  as PERMISSIVE
  for DELETE
  to public
  using (((auth.uid() = user_id) OR (user_id IS NULL)));

create policy "Users can update their own notifications" on public.notifications
  as PERMISSIVE
  for UPDATE
  to public
  using (((auth.uid() = user_id) OR (user_id IS NULL)));

create policy "Users can view their own notifications" on public.notifications
  as PERMISSIVE
  for SELECT
  to public
  using (((auth.uid() = user_id) OR (user_id IS NULL)));

create policy "Users can delete their own posts" on public.posts
  as PERMISSIVE
  for DELETE
  to public
  using ((auth.uid() = user_id));

create policy "Users can insert their own posts" on public.posts
  as PERMISSIVE
  for INSERT
  to public
  with check ((auth.uid() = user_id));

create policy "Users can update their own posts" on public.posts
  as PERMISSIVE
  for UPDATE
  to public
  using ((auth.uid() = user_id));

create policy "Users can view their own posts" on public.posts
  as PERMISSIVE
  for SELECT
  to public
  using ((auth.uid() = user_id));

create policy "Users can insert their own profile" on public.profiles
  as PERMISSIVE
  for INSERT
  to public
  with check ((auth.uid() = id));

create policy "Users can update their own profile" on public.profiles
  as PERMISSIVE
  for UPDATE
  to public
  using ((auth.uid() = id));

create policy "Users can view their own profile" on public.profiles
  as PERMISSIVE
  for SELECT
  to public
  using ((auth.uid() = id));

create policy "Users can delete their own studio_queue items" on public.studio_queue
  as PERMISSIVE
  for DELETE
  to public
  using (((auth.uid() = user_id) OR (user_id IS NULL)));

create policy "Users can insert their own studio_queue items" on public.studio_queue
  as PERMISSIVE
  for INSERT
  to public
  with check (((auth.uid() = user_id) OR (user_id IS NULL)));

create policy "Users can update their own studio_queue items" on public.studio_queue
  as PERMISSIVE
  for UPDATE
  to public
  using (((auth.uid() = user_id) OR (user_id IS NULL)));

create policy "Users can view their own studio_queue items" on public.studio_queue
  as PERMISSIVE
  for SELECT
  to public
  using (((auth.uid() = user_id) OR (user_id IS NULL)));

create policy "workspace_members_delete" on public.workspace_members
  as PERMISSIVE
  for DELETE
  to public
  using ((is_workspace_owner(auth.uid(), workspace_id) OR (is_workspace_admin_or_owner(auth.uid(), workspace_id) AND (role <> 'owner'::text))));

create policy "workspace_members_insert" on public.workspace_members
  as PERMISSIVE
  for INSERT
  to public
  with check (is_workspace_admin_or_owner(auth.uid(), workspace_id));

create policy "workspace_members_select" on public.workspace_members
  as PERMISSIVE
  for SELECT
  to public
  using (((user_id = auth.uid()) OR (workspace_id IN ( SELECT get_user_active_workspaces(auth.uid()) AS get_user_active_workspaces))));

create policy "workspace_members_update" on public.workspace_members
  as PERMISSIVE
  for UPDATE
  to public
  using (is_workspace_admin_or_owner(auth.uid(), workspace_id));

create policy "workspaces_delete" on public.workspaces
  as PERMISSIVE
  for DELETE
  to public
  using ((owner_id = auth.uid()));

create policy "workspaces_insert" on public.workspaces
  as PERMISSIVE
  for INSERT
  to public
  with check ((owner_id = auth.uid()));

create policy "workspaces_select" on public.workspaces
  as PERMISSIVE
  for SELECT
  to public
  using (((owner_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM workspace_members wm
  WHERE ((wm.workspace_id = workspaces.id) AND (wm.user_id = auth.uid()) AND (wm.status = 'active'::text))))));

create policy "workspaces_update" on public.workspaces
  as PERMISSIVE
  for UPDATE
  to public
  using ((owner_id = auth.uid()))
  with check ((owner_id = auth.uid()));

-- ════ TRIGGERS ════
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
CREATE TRIGGER trg_workspace_members_updated_at BEFORE UPDATE ON public.workspace_members FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION set_updated_at();

