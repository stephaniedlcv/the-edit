alter table public.wardrobe_items
drop constraint if exists wardrobe_items_pattern_type_check;

alter table public.wardrobe_items
add constraint wardrobe_items_pattern_type_check
check (
  pattern_type is null
  or pattern_type in (
    'animal_print',
    'floral',
    'striped',
    'polka_dot',
    'plaid',
    'geometric',
    'abstract',
    'mixed_print'
  )
);
