alter table public.wardrobe_items
  add column if not exists item_status text not null default 'active';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'wardrobe_items_item_status_check'
  ) then
    alter table public.wardrobe_items
      add constraint wardrobe_items_item_status_check
      check (item_status in ('active', 'archived', 'donated', 'sold', 'damaged'));
  end if;
end $$;
