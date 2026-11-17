-- Display order for brands (the home ribbon and the shop's brand filter),
-- editable from the admin dashboard later. Seeded in the catalogue's order.
alter table public.brands add column sort_order smallint not null default 0;
