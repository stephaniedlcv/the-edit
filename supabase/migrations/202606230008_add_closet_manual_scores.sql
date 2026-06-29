alter table public.wardrobe_items
add column if not exists love_score integer,
add column if not exists versatility_score integer,
add column if not exists fit_confidence_score integer,
add column if not exists capsule_value_score integer;

update public.wardrobe_items
set versatility_score = round(versatility_score / 10.0)::integer
where versatility_score is not null
  and versatility_score > 10;

update public.wardrobe_items
set
  love_score = case
    when love_score is null then null
    else greatest(0, least(10, love_score))
  end,
  versatility_score = case
    when versatility_score is null then null
    else greatest(0, least(10, versatility_score))
  end,
  fit_confidence_score = case
    when fit_confidence_score is null then null
    else greatest(0, least(10, fit_confidence_score))
  end,
  capsule_value_score = case
    when capsule_value_score is null then null
    else greatest(0, least(10, capsule_value_score))
  end;

alter table public.wardrobe_items
drop constraint if exists wardrobe_items_love_score_check;

alter table public.wardrobe_items
add constraint wardrobe_items_love_score_check
check (love_score is null or love_score between 0 and 10);

alter table public.wardrobe_items
drop constraint if exists wardrobe_items_versatility_score_check;

alter table public.wardrobe_items
add constraint wardrobe_items_versatility_score_check
check (versatility_score is null or versatility_score between 0 and 10);

alter table public.wardrobe_items
drop constraint if exists wardrobe_items_fit_confidence_score_check;

alter table public.wardrobe_items
add constraint wardrobe_items_fit_confidence_score_check
check (fit_confidence_score is null or fit_confidence_score between 0 and 10);

alter table public.wardrobe_items
drop constraint if exists wardrobe_items_capsule_value_score_check;

alter table public.wardrobe_items
add constraint wardrobe_items_capsule_value_score_check
check (capsule_value_score is null or capsule_value_score between 0 and 10);
