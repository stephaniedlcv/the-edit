-- Style OS / The Stephanie Edit
-- Import v2: sync missing mock owned items into Supabase
-- Run manually in Supabase SQL Editor after style_os_real_seed.sql.

begin;

insert into public.wardrobe_items (
  user_id,
  status,
  name,
  category,
  color_family,
  color_name,
  size,
  brand,
  source,
  notes,
  styling_notes,
  vibes
)
select
  null,
  'owned',
  'Gray Fitted Tee',
  'top',
  'statement',
  'Soft Gray',
  'M',
  'Acloset',
  'owned closet',
  'Simple fitted tee from current closet.',
  'Useful as a casual base, but not a priority color for Dark Autumn. Keep it grounded with brown, denim, or gold accessories.',
  ARRAY['minimal','casual']::style_vibe[]
where not exists (
  select 1 from public.wardrobe_items
  where user_id is null and name = 'Gray Fitted Tee'
);

insert into public.wardrobe_items (
  user_id,
  status,
  name,
  category,
  color_family,
  color_name,
  size,
  brand,
  source,
  notes,
  styling_notes,
  vibes
)
select
  null,
  'owned',
  'Dark Brown Loafers',
  'shoes',
  'brown',
  'Dark Brown',
  '8',
  'Acloset',
  'owned closet',
  'Polished dark brown loafer option.',
  'Strong shoe for work outfits, especially with cream, camel, denim, beige, and burgundy.',
  ARRAY['classic','work','elevated']::style_vibe[]
where not exists (
  select 1 from public.wardrobe_items
  where user_id is null and name = 'Dark Brown Loafers'
);

insert into public.wardrobe_items (
  user_id,
  status,
  name,
  category,
  color_family,
  color_name,
  size,
  brand,
  source,
  notes,
  styling_notes,
  vibes
)
select
  null,
  'owned',
  'Brown Work Tote',
  'bag',
  'brown',
  'Warm Brown',
  null,
  'Acloset',
  'owned closet',
  'Structured work tote from current closet.',
  'Useful office anchor. Helps neutral outfits look more intentional and finished.',
  ARRAY['classic','work','elevated']::style_vibe[]
where not exists (
  select 1 from public.wardrobe_items
  where user_id is null and name = 'Brown Work Tote'
);

insert into public.wardrobe_items (
  user_id,
  status,
  name,
  category,
  color_family,
  color_name,
  size,
  brand,
  source,
  notes,
  styling_notes,
  vibes
)
select
  null,
  'owned',
  'Cream Shoulder Bag',
  'bag',
  'cream',
  'Cream',
  null,
  'Acloset',
  'owned closet',
  'Light neutral shoulder bag from current closet.',
  'Works as a soft lightener, but pair with warm colors so it does not feel too stark.',
  ARRAY['classic','minimal','elevated']::style_vibe[]
where not exists (
  select 1 from public.wardrobe_items
  where user_id is null and name = 'Cream Shoulder Bag'
);

commit;
