-- Create slideshows table
create table public.slideshows (
  id text not null,
  user_id uuid default auth.uid() not null,
  workspace_id uuid,
  title text not null,
  format_id text not null,
  slides jsonb default '[]'::jsonb not null,
  script_text text,
  caption text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint slideshows_pkey primary key (id),
  constraint slideshows_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade,
  constraint slideshows_workspace_id_fkey foreign key (workspace_id) references public.workspaces(id) on delete set null
);

-- Enable RLS
alter table public.slideshows enable row level security;

-- Create policies
create policy "Users can view their own slideshows"
  on public.slideshows for select
  using (auth.uid() = user_id);

create policy "Users can insert their own slideshows"
  on public.slideshows for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own slideshows"
  on public.slideshows for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own slideshows"
  on public.slideshows for delete
  using (auth.uid() = user_id);

-- Create indexes
create index idx_slideshows_user_id on public.slideshows (user_id);
create index idx_slideshows_workspace_id on public.slideshows (workspace_id);
create index idx_slideshows_created_at on public.slideshows (created_at desc);
