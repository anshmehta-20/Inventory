-- STORE STATUS TABLE
create table if not exists public.store_status (
  id uuid primary key default gen_random_uuid(),
  is_open boolean not null default true,
  updated_at timestamp with time zone default now(),
  updated_by uuid references auth.users(id) on delete set null
);

-- ENABLE RLS (Row-Level Security)
alter table public.store_status enable row level security;

-- POLICIES

-- Users can view store status
create policy "Users can view store status"
on public.store_status
for select
using (true);

-- Admins can manage store status
create policy "Admins can manage store status"
on public.store_status
for all
using (public.is_admin())
with check (public.is_admin());
