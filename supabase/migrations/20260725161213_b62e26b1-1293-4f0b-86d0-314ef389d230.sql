
create table public.countdowns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  target_at timestamptz not null,
  accent text not null default 'blue',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.countdowns to authenticated;
grant all on public.countdowns to service_role;

alter table public.countdowns enable row level security;

create policy "own_select" on public.countdowns for select to authenticated using (auth.uid() = user_id);
create policy "own_insert" on public.countdowns for insert to authenticated with check (auth.uid() = user_id);
create policy "own_update" on public.countdowns for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.countdowns for delete to authenticated using (auth.uid() = user_id);

create index countdowns_user_id_idx on public.countdowns(user_id, target_at);

create or replace function public.tg_set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

create trigger countdowns_set_updated_at before update on public.countdowns
for each row execute function public.tg_set_updated_at();

alter publication supabase_realtime add table public.countdowns;
