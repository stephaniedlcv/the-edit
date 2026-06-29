-- Style OS / The Stephanie Edit
-- Real initial seed v1
-- Run this manually in Supabase SQL Editor after running the foundation migration.

begin;

-- Clean previous seed rows without touching future authenticated user rows.
delete from public.price_history
where wishlist_item_id in (
  select id from public.wishlist_items where user_id is null
);

delete from public.wishlist_item_images
where wishlist_item_id in (
  select id from public.wishlist_items where user_id is null
);

delete from public.wardrobe_item_images
where wardrobe_item_id in (
  select id from public.wardrobe_items where user_id is null
);

delete from public.wishlist_items where user_id is null;
delete from public.wardrobe_items where user_id is null;
delete from public.style_profiles where user_id is null;

insert into public.style_profiles (
  user_id,
  display_name,
  style_system,
  palette_label,
  silhouette_label,
  location_label,
  aesthetic_summary,
  measurements,
  palette,
  fit_rules,
  shopping_rules,
  climate_rules,
  capsule_goals,
  ai_rules,
  is_active
)
values (
  null,
  'Stephanie',
  'The Stephanie Edit',
  'Dark Autumn / Warm Olive',
  'Bottom Hourglass',
  'Puerto Rico',
  'Classic, minimal, elevated, warm, tropical-polished.',
  $$[
    {"label":"Bust","value":"34\"","note":"Keep tops fitted but not tight."},
    {"label":"Waist","value":"28.5\"","note":"Define with belts, high rise, and open layers."},
    {"label":"Hips","value":"38.5\"","note":"Prioritize clean drape through the hip."},
    {"label":"Glutes","value":"39\"","note":"Check length and fabric pull on bottoms."}
  ]$$::jsonb,
  $$[
    {"name":"Chocolate","family":"brown","role":"Core neutral"},
    {"name":"Camel","family":"camel","role":"Warm lightener"},
    {"name":"Olive","family":"olive","role":"Color builder"},
    {"name":"Burgundy","family":"burgundy","role":"Elegant color"},
    {"name":"Plum","family":"plum","role":"Soft statement"},
    {"name":"Muted Mustard","family":"mustard","role":"Tropical warmth"},
    {"name":"Terracotta","family":"statement","role":"Caribbean pop"},
    {"name":"Cream","family":"cream","role":"Soft base"}
  ]$$::jsonb,
  $$[
    {"title":"Define the waist","body":"Bottom Hourglass benefits from visible waist definition through belts, high-rise bottoms, tucked tops, wrap details, or open vertical layers."},
    {"title":"Balance the hip line","body":"Avoid stiff cuts that stop at the widest part of the hip. Prefer pieces that either crop higher or fall cleanly past the hip."},
    {"title":"Prefer vertical structure","body":"Open blazers, vest layers, long lines, and clean lapels help elongate the frame without adding bulk."},
    {"title":"Use volume intentionally","body":"If the bottom is wide-leg, keep the top fitted or structured. If the top is dramatic, ground it with cleaner bottoms."}
  ]$$::jsonb,
  $$[
    {"title":"No duplicate neutrals without a job","body":"Black, beige, cream, brown, denim, and basics must add a new silhouette, fabric, or use case to be worth adding."},
    {"title":"Color must create outfits","body":"A wishlist color piece should combine with at least 5 owned pieces or unlock a clear capsule gap."},
    {"title":"Statement pieces need styling proof","body":"A statement item should have at least 3 realistic outfit formulas before moving from consider to buy-priority."},
    {"title":"Shoes and accessories get priority","body":"Because the closet has limited shoes and accessories, these can create more outfit variety than another neutral top."}
  ]$$::jsonb,
  $$[
    {"title":"Puerto Rico heat","body":"Prioritize breathable fabrics, sleeveless layers, open blazers, sandals, mules, and pieces that survive humidity."},
    {"title":"AC-friendly polish","body":"Keep light layers for offices and indoor spaces without building outfits around heavy outerwear."},
    {"title":"Rain-aware styling","body":"Avoid delicate shoes or dragging hems on high-rain days. Prefer practical shoes with polished accessories."}
  ]$$::jsonb,
  $$[
    "Add intentional color without losing the classic elevated base.",
    "Reduce over-reliance on black, white, beige, and cream.",
    "Build work outfits that still feel tropical and fun.",
    "Increase shoes, bags, belts, and jewelry as outfit multipliers.",
    "Use wishlist discipline before buying statement pieces."
  ]$$::jsonb,
  $$[
    "Always evaluate color against Dark Autumn first, then allow intentional Caribbean pops when they create useful outfits.",
    "Flag duplicates when an item repeats an existing color, silhouette, or function.",
    "Prioritize waist definition and clean hip drape for Bottom Hourglass.",
    "For Puerto Rico, avoid recommendations that depend on heavy layering or cold-weather styling.",
    "Recommend shoes and accessories often because they are a known closet gap."
  ]$$::jsonb,
  true
);

insert into public.wardrobe_items (
  user_id, status, name, category, color_family, color_name, size, brand, source, notes, styling_notes, vibes
)
values
  (null, 'owned', 'Black Blazer', 'outerwear', 'black', 'Black', 'M', 'Acloset', 'owned closet', 'A reliable office layer for polished outfits.', 'Best when softened with cream, camel, denim, or warm brown so it does not feel too harsh.', ARRAY['classic','work','elevated']::style_vibe[]),
  (null, 'owned', 'Beige Blazer', 'outerwear', 'beige', 'Warm Beige', 'M', 'Acloset', 'owned closet', 'Light neutral blazer for office formulas.', 'Works best with chocolate, camel, denim, and gold-toned accessories.', ARRAY['classic','minimal','work']::style_vibe[]),
  (null, 'owned', 'Light Rose Blazer', 'outerwear', 'statement', 'Soft Rose', 'M', 'Acloset', 'owned closet', 'Soft feminine blazer that needs grounding.', 'Keep the rest of the look warm and quiet so the rose reads intentional.', ARRAY['elevated','statement','work']::style_vibe[]),
  (null, 'owned', 'Warm Brown Blazer Vest', 'outerwear', 'brown', 'Warm Brown', 'M', 'Acloset', 'owned closet', 'Sleeveless tailored vest for warm office days.', 'Wear open to create a vertical line and keep the outfit breathable.', ARRAY['classic','work','elevated']::style_vibe[]),
  (null, 'owned', 'White Cropped Jacket', 'outerwear', 'white', 'Warm White', 'M', 'Acloset', 'owned closet', 'Current light jacket option.', 'Use sparingly with warm colors so it does not feel too stark.', ARRAY['casual','elevated','tropical']::style_vibe[]),
  (null, 'owned', 'Black Cardigan', 'outerwear', 'black', 'Black', 'M', 'Acloset', 'owned closet', 'Light layering piece for cooler spaces.', 'Good for AC days, but not a color-building piece.', ARRAY['minimal','casual','work']::style_vibe[]),

  (null, 'owned', 'Cream Camisole', 'top', 'cream', 'Cream', 'M', 'Acloset', 'owned closet', 'Soft base layer for blazers and cardigans.', 'A strong base with chocolate, olive, camel, denim, and burgundy.', ARRAY['minimal','classic','elevated']::style_vibe[]),
  (null, 'owned', 'Black Bodysuit', 'top', 'black', 'Black', 'M', 'Acloset', 'owned closet', 'Reliable fitted base top.', 'Use when the bottom or outerwear brings warmth and softness.', ARRAY['minimal','classic','casual']::style_vibe[]),
  (null, 'owned', 'Brown Tank Top', 'top', 'brown', 'Chocolate Brown', 'M', 'Acloset', 'owned closet', 'Warm neutral tank for PR weather.', 'Pairs easily with denim, beige, camel, cream, and gold accessories.', ARRAY['minimal','casual','tropical']::style_vibe[]),
  (null, 'owned', 'Burgundy Crop Top', 'top', 'burgundy', 'Warm Burgundy', 'M', 'Acloset', 'owned closet', 'Color base that still fits Dark Autumn.', 'Good with brown, denim, camel, and cream for intentional color.', ARRAY['statement','casual','tropical']::style_vibe[]),
  (null, 'owned', 'White Button Shirt', 'top', 'white', 'White', 'M', 'Acloset', 'owned closet', 'Classic button-down option.', 'Warm it up with brown belts, camel shoes, or gold jewelry.', ARRAY['classic','work','elevated']::style_vibe[]),
  (null, 'owned', 'Casual Striped Button Shirt', 'top', 'blue', 'Muted Blue Stripe', 'M', 'Acloset', 'owned closet', 'Casual button shirt, less office-elegant.', 'Best for Friday denim or relaxed office days.', ARRAY['casual','classic']::style_vibe[]),
  (null, 'owned', 'Black Tube Top', 'top', 'black', 'Black', 'M', 'Acloset', 'owned closet', 'Simple warm-weather base.', 'Needs elevated bottoms, belt, or accessories to avoid feeling too basic.', ARRAY['casual','minimal','tropical']::style_vibe[]),
  (null, 'owned', 'Cream Knit Top', 'top', 'cream', 'Soft Cream', 'M', 'Acloset', 'owned closet', 'Soft neutral top for polished formulas.', 'Very useful under blazer vest or warm neutral blazer.', ARRAY['classic','minimal','work']::style_vibe[]),

  (null, 'owned', 'Brown Wide Leg Pants', 'bottom', 'brown', 'Chocolate Brown', 'M', 'Acloset', 'owned closet', 'Strong foundation bottom.', 'One of the best base pieces for Dark Autumn office outfits.', ARRAY['classic','work','elevated']::style_vibe[]),
  (null, 'owned', 'Dark Denim Straight Leg Jeans', 'bottom', 'denim', 'Dark Denim', 'M', 'Acloset', 'owned closet', 'Friday office and casual polish essential.', 'Dark wash keeps denim elevated enough for polished casual outfits.', ARRAY['classic','casual','work']::style_vibe[]),
  (null, 'owned', 'Black Straight Leg Pants', 'bottom', 'black', 'Black', 'M', 'Acloset', 'owned closet', 'Work-safe neutral pant.', 'Use with camel, cream, burgundy, or olive to avoid all-black repetition.', ARRAY['work','classic','minimal']::style_vibe[]),
  (null, 'owned', 'Beige Wide Leg Pants', 'bottom', 'beige', 'Warm Beige', 'M', 'Acloset', 'owned closet', 'Light warm neutral bottom.', 'Works well with brown, cream, burgundy, and olive.', ARRAY['classic','work','minimal']::style_vibe[]),
  (null, 'owned', 'Dark Denim Wide Leg Jeans', 'bottom', 'denim', 'Dark Denim', 'M', 'Acloset', 'owned closet', 'Wide-leg denim option.', 'Good for balancing fitted tops and cropped jackets.', ARRAY['casual','classic','elevated']::style_vibe[]),

  (null, 'owned', 'Black Neutral Dress', 'dress', 'black', 'Black', 'M', 'Acloset', 'owned closet', 'Simple black dress.', 'Needs warm accessories to avoid feeling flat.', ARRAY['classic','minimal','elevated']::style_vibe[]),
  (null, 'owned', 'Neutral Knit Dress', 'dress', 'beige', 'Warm Neutral', 'M', 'Acloset', 'owned closet', 'Soft neutral dress option.', 'Best with brown belt, gold jewelry, and warm sandals.', ARRAY['classic','minimal','elevated']::style_vibe[]),

  (null, 'owned', 'Adidas Tokyo Sneakers', 'shoes', 'statement', 'Sporty Statement', '8', 'Adidas', 'owned closet', 'Sporty casual shoe.', 'Best for casual polish or weekend looks, not core office outfits.', ARRAY['casual','statement']::style_vibe[]),
  (null, 'owned', 'Neutral Sandals', 'shoes', 'beige', 'Warm Beige', '8', 'Acloset', 'owned closet', 'Warm-weather sandal option.', 'Useful for PR, but needs polished bag/accessories to feel elevated.', ARRAY['tropical','casual','minimal']::style_vibe[]),

  (null, 'owned', 'Brown Leather Belt', 'accessory', 'brown', 'Warm Brown', null, 'Acloset', 'owned closet', 'Core styling accessory.', 'Important for defining waist and finishing outfits.', ARRAY['classic','elevated']::style_vibe[]),
  (null, 'owned', 'Gold Hoop Earrings', 'jewelry', 'mustard', 'Warm Gold', null, 'Acloset', 'owned closet', 'Everyday gold jewelry.', 'Works with the Dark Autumn palette and warms up black/white outfits.', ARRAY['classic','elevated','tropical']::style_vibe[]),
  (null, 'owned', 'Gold Watch', 'jewelry', 'mustard', 'Warm Gold', null, 'Acloset', 'owned closet', 'Daily finishing piece.', 'Helps simple outfits feel intentional and polished.', ARRAY['classic','work','elevated']::style_vibe[]);

insert into public.wishlist_items (
  user_id, status, name, category, color_family, color_name, size, brand, source, product_url, vibes,
  decision, priority_tier, purchase_order, duplicate_risk, closet_gap,
  priority_score, outfit_potential, closet_impact_score,
  current_price, target_price, lowest_price, currency, price_watch, notes
)
values
  (null, 'wishlist', 'Camel Blazer', 'outerwear', 'camel', 'Warm Camel', 'M', 'SHEIN', 'wishlist seed', 'https://www.shein.com/', ARRAY['classic','work','elevated']::style_vibe[], 'buy-priority', 'foundation-buys', 1, 'low', 'workwear', 9, 9, 10, 28.99, 22.00, 25.49, 'USD', true, 'The strongest foundation blazer because it lightens the closet without going cold or pastel.'),
  (null, 'wishlist', 'Burgundy Blazer', 'outerwear', 'burgundy', 'Warm Burgundy', 'M', 'SHEIN', 'wishlist seed', 'https://www.shein.com/', ARRAY['work','statement','elevated']::style_vibe[], 'wishlist', 'color-builders', 2, 'low', 'color', 8, 8, 9, 31.49, 24.00, 27.99, 'USD', true, 'Adds color while staying rich, warm, and office-ready.'),
  (null, 'wishlist', 'Olive Blazer', 'outerwear', 'olive', 'Muted Olive', 'M', 'SHEIN', 'wishlist seed', 'https://www.shein.com/', ARRAY['classic','work','tropical']::style_vibe[], 'wishlist', 'color-builders', 3, 'low', 'color', 8, 8, 8, 26.99, 21.00, 24.99, 'USD', true, 'A good Dark Autumn color builder that pairs well with denim, cream, camel, and brown.'),
  (null, 'wishlist', 'Chocolate Blazer', 'outerwear', 'brown', 'Chocolate', 'M', 'SHEIN', 'wishlist seed', 'https://www.shein.com/', ARRAY['classic','work','elevated']::style_vibe[], 'wishlist', 'foundation-buys', 4, 'medium', 'workwear', 7, 8, 8, 33.99, 25.00, 30.49, 'USD', true, 'Useful, but lower priority than camel because the closet already has many brown/neutral pieces.'),
  (null, 'wishlist', 'Plum Blazer', 'outerwear', 'plum', 'Muted Plum', 'M', 'SHEIN', 'wishlist seed', 'https://www.shein.com/', ARRAY['statement','work','elevated']::style_vibe[], 'consider', 'statement-review', 5, 'low', 'statement', 6, 6, 7, 34.99, 24.00, 31.99, 'USD', false, 'Pretty color, but needs enough outfit formulas before buying.'),
  (null, 'wishlist', 'Burgundy Loafers', 'shoes', 'burgundy', 'Deep Burgundy', '8', 'SHEIN', 'wishlist seed', 'https://www.shein.com/', ARRAY['classic','work','statement']::style_vibe[], 'buy-priority', 'foundation-buys', 6, 'low', 'shoes', 9, 9, 9, 24.99, 18.00, 22.49, 'USD', true, 'Shoes are a real gap. Burgundy adds color without feeling random.'),
  (null, 'wishlist', 'Dark Brown Mules', 'shoes', 'brown', 'Dark Brown', '8', 'SHEIN', 'wishlist seed', 'https://www.shein.com/', ARRAY['classic','work','elevated']::style_vibe[], 'wishlist', 'foundation-buys', 7, 'low', 'shoes', 8, 9, 8, 22.99, 17.00, 20.99, 'USD', true, 'Useful shoe for work looks and warm neutral outfits.'),
  (null, 'wishlist', 'Orange Beaded Sandals', 'shoes', 'statement', 'Caribbean Orange', '8', 'SHEIN', 'wishlist seed', 'https://www.shein.com/', ARRAY['tropical','statement','casual']::style_vibe[], 'consider', 'statement-review', 8, 'low', 'tropical', 6, 5, 6, 19.99, 14.00, 18.49, 'USD', false, 'Fun PR piece, but should only be bought if it creates enough tropical outfits.'),
  (null, 'wishlist', 'Olive Crossbody Bag', 'bag', 'olive', 'Muted Olive', null, 'SHEIN', 'wishlist seed', 'https://www.shein.com/', ARRAY['classic','casual','tropical']::style_vibe[], 'wishlist', 'color-builders', 9, 'low', 'accessory', 8, 8, 8, 18.99, 14.00, 16.99, 'USD', true, 'Adds color in a low-risk way and helps simple outfits look styled.'),
  (null, 'wishlist', 'Camel Structured Bag', 'bag', 'camel', 'Warm Camel', null, 'SHEIN', 'wishlist seed', 'https://www.shein.com/', ARRAY['classic','work','elevated']::style_vibe[], 'wishlist', 'foundation-buys', 10, 'low', 'accessory', 8, 9, 8, 25.99, 19.00, 23.99, 'USD', true, 'A structured warm bag would elevate many simple office looks.'),
  (null, 'wishlist', 'Brown Waist Belt', 'accessory', 'brown', 'Warm Brown', null, 'SHEIN', 'wishlist seed', 'https://www.shein.com/', ARRAY['classic','elevated','work']::style_vibe[], 'buy-priority', 'foundation-buys', 11, 'medium', 'accessory', 8, 10, 9, 8.99, 7.00, 8.49, 'USD', false, 'Belts are high-impact because they define the waist and finish outfits.'),
  (null, 'wishlist', 'Gold Statement Earrings', 'jewelry', 'mustard', 'Warm Gold', null, 'SHEIN', 'wishlist seed', 'https://www.shein.com/', ARRAY['statement','elevated','tropical']::style_vibe[], 'wishlist', 'color-builders', 12, 'medium', 'accessory', 7, 8, 7, 6.99, 5.00, 6.49, 'USD', false, 'Small statement piece that can make basics feel more Caribbean and styled.'),
  (null, 'wishlist', 'Mustard Satin Blouse', 'top', 'mustard', 'Muted Mustard', 'M', 'SHEIN', 'wishlist seed', 'https://www.shein.com/', ARRAY['statement','work','tropical']::style_vibe[], 'consider', 'color-builders', 13, 'low', 'color', 7, 7, 7, 17.99, 13.00, 15.99, 'USD', true, 'Good color direction if the fabric does not look too shiny or cheap.'),
  (null, 'wishlist', 'Forest Green Blouse', 'top', 'olive', 'Forest Green', 'M', 'SHEIN', 'wishlist seed', 'https://www.shein.com/', ARRAY['classic','work','elevated']::style_vibe[], 'wishlist', 'color-builders', 14, 'low', 'color', 8, 8, 8, 16.99, 12.00, 15.49, 'USD', true, 'A strong color builder for office looks without being loud.'),
  (null, 'wishlist', 'Statement Blue Blazer', 'outerwear', 'blue', 'Deep Blue', 'M', 'SHEIN', 'wishlist seed', 'https://www.shein.com/', ARRAY['statement','work']::style_vibe[], 'consider', 'statement-review', 15, 'low', 'statement', 5, 5, 5, 34.99, 24.00, 32.99, 'USD', false, 'Potential statement piece, but lower priority than warm Dark Autumn colors.');

insert into public.price_history (wishlist_item_id, observed_at, price, currency, source_url)
select id, now() - interval '14 days', current_price + 3.00, currency, product_url
from public.wishlist_items
where user_id is null and current_price is not null;

insert into public.price_history (wishlist_item_id, observed_at, price, currency, source_url)
select id, now() - interval '7 days', current_price + 1.00, currency, product_url
from public.wishlist_items
where user_id is null and current_price is not null;

insert into public.price_history (wishlist_item_id, observed_at, price, currency, source_url)
select id, now(), current_price, currency, product_url
from public.wishlist_items
where user_id is null and current_price is not null;

commit;
