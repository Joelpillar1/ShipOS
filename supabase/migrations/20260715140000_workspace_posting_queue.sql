-- Store posting-queue slots + timezone for MCP + app sync (workspace-scoped)
alter table public.workspaces
  add column if not exists posting_queue jsonb;

comment on column public.workspaces.posting_queue is
  'Posting queue config: { timezone: string, slots: [{ id, time, days }] }. Used by MCP get_queue_slots / set_queue_slots / schedule_to_queue.';
