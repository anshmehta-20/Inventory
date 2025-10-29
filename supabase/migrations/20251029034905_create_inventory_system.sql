-- CATEGORY TABLE
create table public.category (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text
);

-- INVENTORY ITEMS TABLE
create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  sku text not null unique default '',
  category text references public.category(name) on delete set null default null,
  quantity integer not null default 0,
  is_visible boolean not null default true,
  last_updated timestamp not null default now(),
  updated_by uuid references auth.users(id)
);

-- TRIGGER FUNCTION TO UPDATE TIMESTAMP
create or replace function public.update_last_updated()
returns trigger as $$
begin
  new.last_updated = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_update_last_updated
before update on public.inventory_items
for each row
execute function public.update_last_updated();

-- TRIGGER FUNCTION TO UPDATE TIMESTAMP
create or replace function public.update_last_updated()
returns trigger
as $$
begin
  new.last_updated = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_update_last_updated
before update on public.inventory_items
for each row
execute function public.update_last_updated();


-- HELPER FUNCTION TO CHECK IF USER IS ADMIN
create or replace function public.is_admin()
returns boolean
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$ language sql security definer;


-- ENABLE RLS
alter table public.category enable row level security;
alter table public.inventory_items enable row level security;
alter table public.admin_users enable row level security;


-- POLICIES FOR INVENTORY ITEMS
create policy "Admins can manage inventory"
on public.inventory_items
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Users can view inventory"
on public.inventory_items
for select
using (true);


-- POLICIES FOR ADMIN USERS
create policy "Admins can view admin_users"
on public.admin_users
for select
using (public.is_admin());

create policy "Admins can manage admin_users"
on public.admin_users
for all
using (public.is_admin())
with check (public.is_admin());

-- POLICIES FOR CATEGORY
create policy "Admins can manage category"
on public.category
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Users can view category"
on public.category
for select
using (true);
