alter table public.wardrobe_items
add column if not exists pattern_type text,
add column if not exists pattern_subtype text;

create index if not exists idx_wardrobe_items_pattern_type
on public.wardrobe_items(pattern_type);

create index if not exists idx_wardrobe_items_pattern_subtype
on public.wardrobe_items(pattern_subtype);
