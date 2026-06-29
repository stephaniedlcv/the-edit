-- ============================================================
-- The Stephanie Edit — Supabase Initial Schema
-- Paste this in full into: Supabase → SQL Editor → New query
-- Run once on a fresh project. Safe to re-run (uses IF NOT EXISTS).
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. OWNED CLOSET ITEMS
-- ─────────────────────────────────────────────
create table if not exists wardrobe_items (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  status               text not null default 'owned',
  category             text not null,
  -- category values: outerwear | tops | bottoms | dresses | shoes | bags | accessories | jewelry
  item_status          text not null default 'active',
  -- item_status values: active | archived | donated | sold | damaged
  subcategory          text,
  color_family         text not null,
  color_name           text not null,
  pattern_type         text,
  pattern_subtype      text,
  size                 text,
  brand                text,
  source               text,
  product_url          text,
  paid_price           numeric(10, 2),
  purchase_source      text,
  purchase_date        text,
  notes                text,
  styling_notes        text,
  vibes                text[]    not null default '{}',
  love_score           smallint  check (love_score between 0 and 10),
  versatility_score    smallint  check (versatility_score between 0 and 10),
  fit_confidence_score smallint  check (fit_confidence_score between 0 and 10),
  capsule_value_score  smallint  check (capsule_value_score between 0 and 10),
  is_archived          boolean   not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 2. CLOSET ITEM IMAGES
-- ─────────────────────────────────────────────
create table if not exists wardrobe_item_images (
  id               uuid primary key default gen_random_uuid(),
  wardrobe_item_id uuid not null references wardrobe_items(id) on delete cascade,
  storage_bucket   text not null default 'closet-items',
  image_path       text,
  image_url        text,
  image_type       text not null default 'main',
  -- image_type values: main | front | back | detail | try_on | transparent_cutout
  alt_text         text,
  sort_order       integer not null default 0,
  is_primary       boolean not null default false,
  created_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 3. WISHLIST ITEMS (kept separate from owned closet)
-- ─────────────────────────────────────────────
create table if not exists wishlist_items (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  status              text not null default 'wishlist',
  category            text not null,
  subcategory         text,
  color_family        text not null,
  color_name          text not null,
  pattern_type        text,
  pattern_subtype     text,
  size                text,
  brand               text,
  source              text,
  product_url         text,
  vibes               text[]   not null default '{}',
  decision            text     not null default 'wishlist',
  -- decision values: buy-priority | wishlist | monitor | skip
  priority_tier       text     not null default 'consider',
  -- priority_tier values: foundation-buys | color-builders | statement | price-watch | consider
  purchase_order      integer  not null default 999,
  duplicate_risk      text     not null default 'low',
  -- duplicate_risk values: low | medium | high
  closet_gap          text,
  priority_score      smallint not null default 5,
  outfit_potential    smallint not null default 5,
  closet_impact_score smallint not null default 5,
  current_price       numeric(10, 2),
  target_price        numeric(10, 2),
  lowest_price        numeric(10, 2),
  price_watch         boolean  not null default false,
  notes               text,
  is_archived         boolean  not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 4. WISHLIST ITEM IMAGES
-- ─────────────────────────────────────────────
create table if not exists wishlist_item_images (
  id               uuid primary key default gen_random_uuid(),
  wishlist_item_id uuid not null references wishlist_items(id) on delete cascade,
  storage_bucket   text not null default 'wishlist-items',
  image_path       text,
  image_url        text,
  image_type       text not null default 'main',
  alt_text         text,
  sort_order       integer not null default 0,
  is_primary       boolean not null default false,
  created_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 5. PRICE HISTORY (wishlist price tracking)
-- ─────────────────────────────────────────────
create table if not exists price_history (
  id               uuid primary key default gen_random_uuid(),
  wishlist_item_id uuid not null references wishlist_items(id) on delete cascade,
  price            numeric(10, 2) not null,
  observed_at      timestamptz    not null default now()
);

-- ─────────────────────────────────────────────
-- 6. SAVED OUTFITS
-- ─────────────────────────────────────────────
create table if not exists saved_outfits (
  id                  uuid primary key default gen_random_uuid(),
  title               text     not null default 'Saved outfit',
  status              text     not null default 'saved',
  -- status values: saved | deleted
  source              text     not null default 'generated',
  -- source values: generated | manual
  source_outfit_id    text,
  occasion            text,
  formula             text,
  decision            text,
  generated_piece_ids text[]   not null default '{}',
  edited_piece_ids    text[]   not null default '{}',
  selected_pieces     jsonb    not null default '[]',
  -- JSON array of {id, name, category, subcategory, colorFamily, colorName, imagePath, imageUrl}
  scores              jsonb    not null default '{}',
  styling_instruction text,
  why_it_works        text[]   not null default '{}',
  notes               text,
  worn_at             timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 7. STYLE PROFILE
-- ─────────────────────────────────────────────
create table if not exists style_profiles (
  id                uuid primary key default gen_random_uuid(),
  display_name      text not null default 'The Stephanie Edit',
  style_system      text not null default 'Dark Autumn',
  palette_label     text not null,
  silhouette_label  text not null,
  location_label    text not null,
  aesthetic_summary text,
  measurements      jsonb not null default '{}',
  -- example: {"bust":"34\"","waist":"28.5\"","hips":"38.5\"","glutes":"39\""}
  palette           jsonb not null default '{}',
  -- example: {"approved":["black","brown","camel","burgundy","olive"]}
  fit_rules         jsonb not null default '{}',
  shopping_rules    jsonb not null default '{}',
  climate_rules     jsonb not null default '{}',
  capsule_goals     jsonb not null default '{}',
  ai_rules          jsonb not null default '{}',
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 8. OUTFIT LOG / PLANNER
-- ─────────────────────────────────────────────
create table if not exists outfit_log (
  id            uuid primary key default gen_random_uuid(),
  log_date      date not null,
  status        text not null default 'open',
  -- status values: planned | worn | skipped | open
  title         text,
  outfit_need   text,
  formula       text[]   not null default '{}',
  weather_note  text,
  repeat_signal text,
  notes         text,
  outfit_id     uuid references saved_outfits(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (log_date)
);

-- ─────────────────────────────────────────────
-- INDEXES (for common query patterns)
-- ─────────────────────────────────────────────
create index if not exists wardrobe_items_is_archived_idx
  on wardrobe_items (is_archived);

create index if not exists wishlist_items_is_archived_idx
  on wishlist_items (is_archived);

create index if not exists wishlist_items_purchase_order_idx
  on wishlist_items (purchase_order);

create index if not exists saved_outfits_status_idx
  on saved_outfits (status);

create index if not exists outfit_log_log_date_idx
  on outfit_log (log_date);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- Enable RLS on all tables. Without auth set up,
-- use the service_role key (api-server) for writes
-- and the anon key (frontend) for reads.
-- ─────────────────────────────────────────────
alter table wardrobe_items        enable row level security;
alter table wardrobe_item_images  enable row level security;
alter table wishlist_items        enable row level security;
alter table wishlist_item_images  enable row level security;
alter table price_history         enable row level security;
alter table saved_outfits         enable row level security;
alter table style_profiles        enable row level security;
alter table outfit_log            enable row level security;

-- Allow anon read (frontend, no auth)
create policy if not exists "anon read wardrobe_items"
  on wardrobe_items for select using (true);

create policy if not exists "anon read wardrobe_item_images"
  on wardrobe_item_images for select using (true);

create policy if not exists "anon read wishlist_items"
  on wishlist_items for select using (true);

create policy if not exists "anon read wishlist_item_images"
  on wishlist_item_images for select using (true);

create policy if not exists "anon read price_history"
  on price_history for select using (true);

create policy if not exists "anon read saved_outfits"
  on saved_outfits for select using (true);

create policy if not exists "anon read style_profiles"
  on style_profiles for select using (true);

create policy if not exists "anon read outfit_log"
  on outfit_log for select using (true);

-- ─────────────────────────────────────────────
-- STORAGE BUCKETS
-- Create these manually in Supabase → Storage:
--   • closet-items   (private, images for owned wardrobe)
--   • wishlist-items (private, images for wishlist)
--   • outfit-looks   (private, outfit collage images)
--   • profile        (private, profile photo)
-- ─────────────────────────────────────────────
