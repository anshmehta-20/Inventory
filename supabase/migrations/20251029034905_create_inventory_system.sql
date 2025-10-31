-- CATEGORY TABLE
create table if not exists public.category (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text
);

-- INVENTORY ITEMS TABLE (base product info)
create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text unique,                    -- used only when has_variants = false
  description text,
  category text references public.category(name) on delete set null default null,
  is_visible boolean not null default true,
  has_variants boolean not null default false,     -- NEW: distinguishes variant-type vs single-type
  price int default 0,                                       -- used only when has_variants = false
  quantity integer default 0,                      -- used only when has_variants = false
  last_updated timestamp NOT NULL DEFAULT now(),      -- used only when has_variants = false
  updated_by uuid REFERENCES auth.users(id)
);

-- ITEM VARIANTS TABLE (handles weight, pieces, flavor, etc.)
create table public.item_variants (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.inventory_items(id) on delete cascade,
  sku text not null unique,
  variant_type text check (variant_type IN ('weight', 'pcs', 'price', 'flavor', 'size')) not null,
  variant_value text not null,           -- e.g., '250g', '12pcs', 'Small Pack'
  price int not null default 0,          -- price per variant
  quantity integer not null default 0,   -- stock level
  last_updated timestamp not null default now(),
  updated_by uuid references auth.users(id)
);

-- ADMIN USERS TABLE
create table if not exists public.admin_users (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  constraint admin_users_pkey primary key (id),
  constraint admin_users_user_id_fkey foreign key (user_id)
    references auth.users(id) on delete cascade
) tablespace pg_default;

-- TRIGGER FUNCTION TO UPDATE TIMESTAMP ON VARIANTS
create or replace function public.update_last_updated()
returns trigger
as $$
begin
  new.last_updated = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_update_last_updated_variant
before update on public.item_variants
for each row
execute function public.update_last_updated();

-- FUNCTION TO CHECK IF USER IS ADMIN
create or replace function public.is_admin()
returns boolean
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$ language sql security definer;

-- ENABLE RLS (Row-Level Security)
alter table public.category enable row level security;
alter table public.inventory_items enable row level security;
alter table public.item_variants enable row level security;
alter table public.admin_users enable row level security;

-- POLICIES

-- INVENTORY ITEMS
create policy "Admins can manage inventory items"
on public.inventory_items
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Users can view inventory items"
on public.inventory_items
for select
using (true);

-- ITEM VARIANTS
create policy "Admins can manage item variants"
on public.item_variants
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Users can view item variants"
on public.item_variants
for select
using (true);

-- ADMIN USERS
create policy "Admins can view admin_users"
on public.admin_users
for select
using (public.is_admin());

create policy "Admins can manage admin_users"
on public.admin_users
for all
using (public.is_admin())
with check (public.is_admin());

-- CATEGORY
create policy "Admins can manage category"
on public.category
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Users can view category"
on public.category
for select
using (true);

-- TRIGGER: Nullify Empty Category
create or replace function public.nullify_empty_category_name()
returns trigger
as $$
begin
  if new.category = '' then
    new.category := null;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_nullify_empty_category_name
before insert or update on public.inventory_items
for each row
execute function public.nullify_empty_category_name();

CREATE OR REPLACE FUNCTION public.update_inventory_last_updated()
RETURNS trigger AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_inventory_last_updated
BEFORE UPDATE ON public.inventory_items
FOR EACH ROW
EXECUTE FUNCTION public.update_inventory_last_updated();