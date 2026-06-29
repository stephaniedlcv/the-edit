alter table public.wardrobe_items
  add column if not exists paid_price numeric(10, 2),
  add column if not exists purchase_source text,
  add column if not exists purchase_date date;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'wardrobe_items_paid_price_non_negative'
  ) then
    alter table public.wardrobe_items
      add constraint wardrobe_items_paid_price_non_negative
      check (paid_price is null or paid_price >= 0);
  end if;
end $$;
