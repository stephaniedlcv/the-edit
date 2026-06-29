-- Requires 202606230005_expand_color_family_enum.sql to be applied and committed first.
-- Do not run this migration in the same manual SQL transaction as the enum expansion.

update public.wardrobe_items
set
  color_family = case
    when id = 'e8f35c52-6c17-4536-805e-82a9ef47ff4f' then 'pink'::color_family
    when id = '6009ba62-fc4a-49fc-94ad-56789dcedca0' then 'gray'::color_family
    when id = 'bbd8567f-afbd-47cc-8b17-f84d9f630671' then 'statement'::color_family
    when id = '5c1f26fb-4592-4d9a-aa13-0c83d87098ea' then 'multicolor'::color_family
    when id = '27a92f6d-140f-400a-a55d-32bd11b5a0c6' then 'gray'::color_family
    when id = '390f6feb-efe9-40cc-8c52-39bdfd9dcb62' then 'gray'::color_family
    when id = '87d033af-5695-4be9-9148-d86e2aa43595' then 'gray'::color_family
    when id = '7b9ad645-7614-4a86-9b07-928bea8cb993' then 'brown'::color_family
    when id = '5d08dc7a-068e-4a76-bd73-2b4b5f0b357c' then 'brown'::color_family
    when id = '61283119-b10b-41f2-8718-da820900ab24' then 'gray'::color_family
    when id = '504baec8-16b4-4618-915e-3cf54365b63b' then 'gray'::color_family
    when id = '1896ffbf-57b9-4be2-b39d-8091159690d2' then 'orange'::color_family
    when id = '8d172053-818b-4f88-88fe-6a9fa1c3c20e' then 'multicolor'::color_family
    when id = '6e77405d-2330-4f6d-af06-a493271fa651' then 'pink'::color_family
    when id = 'b246d650-7027-44c8-8cd9-0fe073069b2c' then 'pink'::color_family
    when id = 'f259302a-75be-4eba-938a-41dc9f3e4d53' then 'metallic'::color_family
    when id = '091c8c59-5018-4d21-8630-1106e5f692bb' then 'brown'::color_family
    else color_family
  end,
  pattern_type = case
    when id in (
      '5c1f26fb-4592-4d9a-aa13-0c83d87098ea',
      '7b9ad645-7614-4a86-9b07-928bea8cb993',
      '5d08dc7a-068e-4a76-bd73-2b4b5f0b357c',
      '091c8c59-5018-4d21-8630-1106e5f692bb'
    ) then 'animal_print'
    when id = '8d172053-818b-4f88-88fe-6a9fa1c3c20e' then 'floral'
    when id in (
      '6e77405d-2330-4f6d-af06-a493271fa651',
      'b246d650-7027-44c8-8cd9-0fe073069b2c'
    ) then 'striped'
    else null
  end,
  pattern_subtype = case
    when id = '5c1f26fb-4592-4d9a-aa13-0c83d87098ea' then 'Cow'
    when id in (
      '7b9ad645-7614-4a86-9b07-928bea8cb993',
      '5d08dc7a-068e-4a76-bd73-2b4b5f0b357c'
    ) then 'Leopard'
    when id = '091c8c59-5018-4d21-8630-1106e5f692bb' then 'Snake'
    when id = '8d172053-818b-4f88-88fe-6a9fa1c3c20e' then 'Small Floral'
    when id in (
      '6e77405d-2330-4f6d-af06-a493271fa651',
      'b246d650-7027-44c8-8cd9-0fe073069b2c'
    ) then 'Vertical Stripe'
    else null
  end
where id in (
  'e8f35c52-6c17-4536-805e-82a9ef47ff4f',
  '6009ba62-fc4a-49fc-94ad-56789dcedca0',
  'bbd8567f-afbd-47cc-8b17-f84d9f630671',
  '5c1f26fb-4592-4d9a-aa13-0c83d87098ea',
  '27a92f6d-140f-400a-a55d-32bd11b5a0c6',
  '390f6feb-efe9-40cc-8c52-39bdfd9dcb62',
  '87d033af-5695-4be9-9148-d86e2aa43595',
  '7b9ad645-7614-4a86-9b07-928bea8cb993',
  '5d08dc7a-068e-4a76-bd73-2b4b5f0b357c',
  '61283119-b10b-41f2-8718-da820900ab24',
  '504baec8-16b4-4618-915e-3cf54365b63b',
  '1896ffbf-57b9-4be2-b39d-8091159690d2',
  '8d172053-818b-4f88-88fe-6a9fa1c3c20e',
  '6e77405d-2330-4f6d-af06-a493271fa651',
  'b246d650-7027-44c8-8cd9-0fe073069b2c',
  'f259302a-75be-4eba-938a-41dc9f3e4d53',
  '091c8c59-5018-4d21-8630-1106e5f692bb'
);
