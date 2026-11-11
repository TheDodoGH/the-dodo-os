-- Run in Supabase SQL Editor. Create your user manually in Authentication > Users.
create table if not exists public.projects (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 name text not null,
 client text not null default '',
 brief text,
 notes text,
 status text not null default 'In progress',
 created_at timestamptz not null default now()
);
alter table public.projects enable row level security;
create policy "Read own projects" on public.projects for select to authenticated using (auth.uid() = owner_id);
create policy "Create own projects" on public.projects for insert to authenticated with check (auth.uid() = owner_id);
create policy "Update own projects" on public.projects for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "Delete own projects" on public.projects for delete to authenticated using (auth.uid() = owner_id);
