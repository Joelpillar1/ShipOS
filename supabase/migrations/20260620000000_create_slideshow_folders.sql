-- Create slideshow_folders table
CREATE TABLE IF NOT EXISTS public.slideshow_folders (
  id text NOT NULL,
  user_id uuid DEFAULT auth.uid() NOT NULL,
  workspace_id uuid,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT slideshow_folders_pkey PRIMARY KEY (id),
  CONSTRAINT slideshow_folders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT slideshow_folders_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.slideshow_folders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own slideshow folders"
  ON public.slideshow_folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own slideshow folders"
  ON public.slideshow_folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own slideshow folders"
  ON public.slideshow_folders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own slideshow folders"
  ON public.slideshow_folders FOR DELETE
  USING (auth.uid() = user_id);

-- Add folder_id to public.slideshows table
ALTER TABLE public.slideshows ADD COLUMN IF NOT EXISTS folder_id text;
