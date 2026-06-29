-- Style OS / The Stephanie Edit
-- Supabase foundation v1

create extension if not exists pgcrypto;

do $$ begin
  create type wardrobe_status as enum ('owned', 'wishlist');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type wardrobe_category as enum (
    'top',
    'bottom',
    'dress',
    'outerwear',
    'shoes',
    'bag',
    'accessory',
    'jewelry'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type color_family as enum (
    'black',
    'brown',
    'cream',
    'beige',
    'white',
    'burgundy',
    'olive',
    'camel',
    'plum',
    'mustard',
    'denim',
    'blue',
    'statement'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type style_vibe as enum (
    'classic',
    'minimal',
    'elevated',
    'work',
    'tropical',
    'statement',
    'casual'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type wishlist_decision as enum (
    'wishlist',
    'consider',
    'skip',
    'buy-priority'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type wishlist_priority_tier as enum (
    'foundation-buys',
    'color-builders',
    'statement-review'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type duplicate_risk as enum (
    'low',
    'medium',
    'high'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type closet_gap as enum (
    'color',
    'silhouette',
    'shoes',
    'accessory',
    'workwear',
    'statement',
    'tropical'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type item_image_type as enum (
    'main',
    'front',
    'back',
    'detail',
    'try_on',
    'transparent_cutout'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type outfit_formula_status as enum (
    'tested',
    'idea'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type outfit_log_status as enum (
    'planned',
    'worn',
    'skipped'
  );
exception when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.style_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  display_name text not null default 'Stephanie',
  style_system text not null default 'The Stephanie Edit',
  palette_label text not null default 'Dark Autumn / Warm Olive',
  silhouette_label text not null default 'Bottom Hourglass',
  location_label text not null default 'Puerto Rico',
  aesthetic_summary text,
  measurements jsonb not null default '{}'::jsonb,
  palette jsonb not null default '[]'::jsonb,
  fit_rules jsonb not null default '[]'::jsonb,
  shopping_rules jsonb not null default '[]'::jsonb,
  climate_rules jsonb not null default '[]'::jsonb,
  capsule_goals jsonb not null default '[]'::jsonb,
  ai_rules jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_style_profiles_updated_at on public.style_profiles;
create trigger set_style_profiles_updated_at
before update on public.style_profiles
for each row
execute function public.set_updated_at();

create table if not exists public.wardrobe_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  status wardrobe_status not null default 'owned',
  name text not null,
  category wardrobe_category not null,
  color_family color_family not null,
  color_name text not null,
  size text,
  brand text,
  source text,
  product_url text,
  notes text,
  styling_notes text,
  vibes style_vibe[] not null default '{}'::style_vibe[],
  is_archived boolean not null default false,
  acquired_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wardrobe_items_owned_only check (status = 'owned')
);

drop trigger if exists set_wardrobe_items_updated_at on public.wardrobe_items;
create trigger set_wardrobe_items_updated_at
before update on public.wardrobe_items
for each row
execute function public.set_updated_at();

create index if not exists idx_wardrobe_items_category
on public.wardrobe_items(category);

create index if not exists idx_wardrobe_items_color_family
on public.wardrobe_items(color_family);

create index if not exists idx_wardrobe_items_user_id
on public.wardrobe_items(user_id);

create table if not exists public.wardrobe_item_images (
  id uuid primary key default gen_random_uuid(),
  wardrobe_item_id uuid not null references public.wardrobe_items(id) on delete cascade,
  storage_bucket text not null default 'closet-items',
  image_path text not null,
  image_url text,
  image_type item_image_type not null default 'main',
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_wardrobe_item_images_item_id
on public.wardrobe_item_images(wardrobe_item_id);

create unique index if not exists idx_wardrobe_item_images_one_primary
on public.wardrobe_item_images(wardrobe_item_id)
where is_primary = true;

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  status wardrobe_status not null default 'wishlist',
  name text not null,
  category wardrobe_category not null,
  color_family color_family not null,
  color_name text not null,
  size text,
  brand text,
  source text,
  product_url text,
  vibes style_vibe[] not null default '{}'::style_vibe[],
  decision wishlist_decision not null default 'consider',
  priority_tier wishlist_priority_tier not null default 'statement-review',
  purchase_order integer not null default 999,
  duplicate_risk duplicate_risk not null default 'medium',
  closet_gap closet_gap not null default 'statement',
  priority_score integer not null default 0 check (priority_score >= 0 and priority_score <= 10),
  outfit_potential integer not null default 0 check (outfit_potential >= 0 and outfit_potential <= 10),
  closet_impact_score integer not null default 0 check (closet_impact_score >= 0 and closet_impact_score <= 10),
  current_price numeric(10, 2),
  target_price numeric(10, 2),
  lowest_price numeric(10, 2),
  currency text not null default 'USD',
  price_watch boolean not null default false,
  notes text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wishlist_items_wishlist_only check (status = 'wishlist')
);

drop trigger if exists set_wishlist_items_updated_at on public.wishlist_items;
create trigger set_wishlist_items_updated_at
before update on public.wishlist_items
for each row
execute function public.set_updated_at();

create index if not exists idx_wishlist_items_purchase_order
on public.wishlist_items(purchase_order);

create index if not exists idx_wishlist_items_priority_tier
on public.wishlist_items(priority_tier);

create index if not exists idx_wishlist_items_user_id
on public.wishlist_items(user_id);

create table if not exists public.wishlist_item_images (
  id uuid primary key default gen_random_uuid(),
  wishlist_item_id uuid not null references public.wishlist_items(id) on delete cascade,
  storage_bucket text not null default 'wishlist-items',
  image_path text not null,
  image_url text,
  image_type item_image_type not null default 'main',
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_wishlist_item_images_item_id
on public.wishlist_item_images(wishlist_item_id);

create unique index if not exists idx_wishlist_item_images_one_primary
on public.wishlist_item_images(wishlist_item_id)
where is_primary = true;

create table if not exists public.price_history (
  id uuid primary key default gen_random_uuid(),
  wishlist_item_id uuid not null references public.wishlist_items(id) on delete cascade,
  observed_at timestamptz not null default now(),
  price numeric(10, 2) not null,
  currency text not null default 'USD',
  source_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_price_history_wishlist_item_id
on public.price_history(wishlist_item_id);

create index if not exists idx_price_history_observed_at
on public.price_history(observed_at);

create table if not exists public.outfit_formulas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  status outfit_formula_status not null default 'idea',
  occasion text not null,
  vibe text not null,
  color_story text,
  notes text,
  preview_image_path text,
  preview_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_outfit_formulas_updated_at on public.outfit_formulas;
create trigger set_outfit_formulas_updated_at
before update on public.outfit_formulas
for each row
execute function public.set_updated_at();

create index if not exists idx_outfit_formulas_status
on public.outfit_formulas(status);

create index if not exists idx_outfit_formulas_user_id
on public.outfit_formulas(user_id);

create table if not exists public.outfit_formula_items (
  id uuid primary key default gen_random_uuid(),
  outfit_formula_id uuid not null references public.outfit_formulas(id) on delete cascade,
  wardrobe_item_id uuid references public.wardrobe_items(id) on delete set null,
  wishlist_item_id uuid references public.wishlist_items(id) on delete set null,
  slot text not null,
  styling_role text,
  sort_order integer not null default 0,
  x_position text,
  y_position text,
  width_value text,
  rotate_value text,
  created_at timestamptz not null default now(),
  constraint outfit_formula_items_has_item check (
    wardrobe_item_id is not null or wishlist_item_id is not null
  )
);

create index if not exists idx_outfit_formula_items_formula_id
on public.outfit_formula_items(outfit_formula_id);

create table if not exists public.outfit_log_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  outfit_formula_id uuid references public.outfit_formulas(id) on delete set null,
  worn_date date not null,
  start_time time,
  end_time time,
  title text not null,
  context text,
  status outfit_log_status not null default 'planned',
  outfit_need text,
  notes text,
  weather_snapshot jsonb not null default '{}'::jsonb,
  calendar_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_outfit_log_entries_updated_at on public.outfit_log_entries;
create trigger set_outfit_log_entries_updated_at
before update on public.outfit_log_entries
for each row
execute function public.set_updated_at();

create index if not exists idx_outfit_log_entries_worn_date
on public.outfit_log_entries(worn_date);

create index if not exists idx_outfit_log_entries_status
on public.outfit_log_entries(status);

create index if not exists idx_outfit_log_entries_user_id
on public.outfit_log_entries(user_id);

-- Storage buckets. Buckets are private by default.
insert into storage.buckets (id, name, public)
values
  ('closet-items', 'closet-items', false),
  ('wishlist-items', 'wishlist-items', false),
  ('outfit-looks', 'outfit-looks', false),
  ('profile', 'profile', false)
on conflict (id) do nothing;

-- RLS foundation.
-- Policies are intentionally strict until auth is connected.
alter table public.style_profiles enable row level security;
alter table public.wardrobe_items enable row level security;
alter table public.wardrobe_item_images enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.wishlist_item_images enable row level security;
alter table public.price_history enable row level security;
alter table public.outfit_formulas enable row level security;
alter table public.outfit_formula_items enable row level security;
alter table public.outfit_log_entries enable row level security;

drop policy if exists "Users can read own style profiles" on public.style_profiles;
create policy "Users can read own style profiles"
on public.style_profiles for select
using (auth.uid() = user_id);

drop policy if exists "Users can manage own style profiles" on public.style_profiles;
create policy "Users can manage own style profiles"
on public.style_profiles for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read own wardrobe items" on public.wardrobe_items;
create policy "Users can read own wardrobe items"
on public.wardrobe_items for select
using (auth.uid() = user_id);

drop policy if exists "Users can manage own wardrobe items" on public.wardrobe_items;
create policy "Users can manage own wardrobe items"
on public.wardrobe_items for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read own wishlist items" on public.wishlist_items;
create policy "Users can read own wishlist items"
on public.wishlist_items for select
using (auth.uid() = user_id);

drop policy if exists "Users can manage own wishlist items" on public.wishlist_items;
create policy "Users can manage own wishlist items"
on public.wishlist_items for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
