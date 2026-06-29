alter table public.wardrobe_items
add column if not exists subcategory text;

create index if not exists idx_wardrobe_items_subcategory
on public.wardrobe_items(subcategory);
