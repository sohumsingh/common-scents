-- ---------------------------------------------------------------------------
-- Common Scents — orders (demo checkout)
-- ---------------------------------------------------------------------------
-- This is a portfolio prototype: checkout is simulated and no money is taken.
-- Everything else behaves like a real shop. Prices and stock are checked in
-- the database at the moment of ordering, stock is taken off, and the order
-- keeps a copy of what was bought (names and prices at the time), so later
-- catalogue edits never change an old order.
--
-- Customers can read their own orders; admins can read all of them. Nobody
-- writes to these tables directly: orders are created by place_order() and
-- moved along by admin_set_order_status().
-- ---------------------------------------------------------------------------

create type public.order_status as enum ('paid', 'processing', 'shipped', 'delivered', 'cancelled');

create sequence public.order_number_seq start 100101;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('CS-' || nextval('public.order_number_seq')),
  user_id uuid not null references auth.users (id) on delete cascade,
  status public.order_status not null default 'paid',

  email text not null,
  full_name text not null,
  phone text not null,

  delivery_method text not null check (delivery_method in ('standard', 'express', 'collect')),
  address_line1 text not null default '',
  address_line2 text not null default '',
  suburb text not null default '',
  city text not null default '',
  province text not null default '',
  postal_code text not null default '',

  subtotal_zar integer not null check (subtotal_zar >= 0),
  delivery_fee_zar integer not null check (delivery_fee_zar >= 0),
  total_zar integer not null check (total_zar >= 0),

  payment_method text not null check (payment_method in ('card', 'eft')),
  payment_reference text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_created_idx on public.orders (user_id, created_at desc);
create index orders_status_created_idx on public.orders (status, created_at desc);

create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id text not null,
  variant_id text not null,
  slug text not null,
  brand text not null,
  name text not null,
  variant_label text not null,
  unit_price_zar integer not null check (unit_price_zar >= 0),
  quantity integer not null check (quantity between 1 and 99),
  -- Whether stock was taken off for this line (sizes with a stock figure),
  -- so a cancellation puts back exactly what was taken.
  stock_tracked boolean not null default false
);

create index order_items_order_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- Who can see what
-- ---------------------------------------------------------------------------
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "People read their own orders; admins read all" on public.orders
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));

create policy "People read their own order lines; admins read all" on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = (select auth.uid()) or (select private.is_admin()))
    )
  );

revoke insert, update, delete on public.orders, public.order_items from anon, authenticated;

-- ---------------------------------------------------------------------------
-- place_order: the checkout
-- ---------------------------------------------------------------------------
-- items:   [{ "product_id": "...", "variant_id": "...", "quantity": 2 }, ...]
-- details: { email, full_name, phone, delivery_method, address_line1,
--            address_line2, suburb, city, province, postal_code, payment_method }
--
-- Prices come from the catalogue, never from the browser. Each size is locked
-- while its stock is checked and reduced, so two people can't buy the last
-- bottle at the same time. Problems are raised with a short code as the
-- message (and the fragrance in the detail) for the site to explain.
create or replace function public.place_order(items jsonb, details jsonb)
returns table (order_id uuid, order_number text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  method text := coalesce(details ->> 'delivery_method', '');
  pay text := coalesce(details ->> 'payment_method', '');
  line record;
  subtotal integer := 0;
  fee integer;
  new_id uuid;
  new_number text;
begin
  if uid is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;

  if jsonb_typeof(items) <> 'array' or jsonb_array_length(items) = 0 then
    raise exception 'empty_bag';
  end if;
  if jsonb_array_length(items) > 50 then
    raise exception 'too_many_lines';
  end if;

  -- The details the customer typed (the site checks these too; this is the
  -- last word).
  if length(trim(coalesce(details ->> 'full_name', ''))) not between 2 and 120
     or length(trim(coalesce(details ->> 'phone', ''))) not between 9 and 20
     or coalesce(details ->> 'email', '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_details';
  end if;
  if method not in ('standard', 'express', 'collect') or pay not in ('card', 'eft') then
    raise exception 'invalid_details';
  end if;
  if method <> 'collect' and (
       length(trim(coalesce(details ->> 'address_line1', ''))) not between 3 and 160
       or length(trim(coalesce(details ->> 'city', ''))) not between 2 and 80
       or coalesce(details ->> 'postal_code', '') !~ '^[0-9]{4}$'
       or coalesce(details ->> 'province', '') not in (
         'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
         'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
       )
     ) then
    raise exception 'invalid_address';
  end if;

  -- The bag, merged by size, joined to the live catalogue and locked.
  create temporary table checkout_lines on commit drop as
  select
    v.product_id,
    v.id as variant_id,
    p.slug,
    b.name as brand,
    p.full_name as name,
    v.label as variant_label,
    v.price_zar,
    v.stock_quantity,
    p.is_published,
    wanted.quantity
  from (
    select x.product_id, x.variant_id, sum(x.quantity)::integer as quantity
    from jsonb_to_recordset(items) as x (product_id text, variant_id text, quantity integer)
    group by x.product_id, x.variant_id
  ) wanted
  left join public.product_variants v on v.product_id = wanted.product_id and v.id = wanted.variant_id
  left join public.products p on p.id = v.product_id
  left join public.brands b on b.slug = p.brand_slug;

  perform 1
  from public.product_variants v
  join checkout_lines c on c.product_id = v.product_id and c.variant_id = v.id
  order by v.product_id, v.id
  for update of v;

  -- Re-read stock now that the rows are locked.
  update checkout_lines c set stock_quantity = v.stock_quantity
  from public.product_variants v
  where v.product_id = c.product_id and v.id = c.variant_id;

  for line in select * from checkout_lines loop
    if line.variant_id is null or not coalesce(line.is_published, false) then
      raise exception 'unavailable';
    end if;
    if line.quantity is null or line.quantity < 1 or line.quantity > 99 then
      raise exception 'invalid_quantity' using detail = line.name;
    end if;
    if line.stock_quantity is not null and line.stock_quantity < line.quantity then
      if line.stock_quantity = 0 then
        raise exception 'sold_out' using detail = line.name || ' ' || line.variant_label;
      end if;
      raise exception 'not_enough_stock' using detail = line.name || ' ' || line.variant_label || '|' || line.stock_quantity;
    end if;
    subtotal := subtotal + line.price_zar * line.quantity;
  end loop;

  -- Delivery: free standard delivery from R1 500.
  fee := case method
    when 'standard' then case when subtotal >= 1500 then 0 else 99 end
    when 'express' then 180
    else 0
  end;

  insert into public.orders (
    user_id, email, full_name, phone, delivery_method,
    address_line1, address_line2, suburb, city, province, postal_code,
    subtotal_zar, delivery_fee_zar, total_zar, payment_method, payment_reference
  ) values (
    uid,
    lower(trim(details ->> 'email')),
    trim(details ->> 'full_name'),
    trim(details ->> 'phone'),
    method,
    case when method = 'collect' then '' else trim(coalesce(details ->> 'address_line1', '')) end,
    case when method = 'collect' then '' else trim(coalesce(details ->> 'address_line2', '')) end,
    case when method = 'collect' then '' else trim(coalesce(details ->> 'suburb', '')) end,
    case when method = 'collect' then '' else trim(coalesce(details ->> 'city', '')) end,
    case when method = 'collect' then '' else coalesce(details ->> 'province', '') end,
    case when method = 'collect' then '' else coalesce(details ->> 'postal_code', '') end,
    subtotal, fee, subtotal + fee, pay,
    'DEMO-' || upper(substr(md5(gen_random_uuid()::text), 1, 10))
  )
  returning id, orders.order_number into new_id, new_number;

  insert into public.order_items (
    order_id, product_id, variant_id, slug, brand, name, variant_label,
    unit_price_zar, quantity, stock_tracked
  )
  select new_id, c.product_id, c.variant_id, c.slug, c.brand, c.name, c.variant_label,
         c.price_zar, c.quantity, c.stock_quantity is not null
  from checkout_lines c;

  update public.product_variants v
  set stock_quantity = v.stock_quantity - c.quantity
  from checkout_lines c
  where v.product_id = c.product_id and v.id = c.variant_id and v.stock_quantity is not null;

  return query select new_id, new_number;
end;
$$;

revoke execute on function public.place_order(jsonb, jsonb) from public, anon;
grant execute on function public.place_order(jsonb, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- admin_set_order_status: moving an order along
-- ---------------------------------------------------------------------------
-- Admins only. Cancelling puts the stock back; a cancelled order stays
-- cancelled.
create or replace function public.admin_set_order_status(target uuid, new_status public.order_status)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_status public.order_status;
begin
  if not private.is_admin() then
    raise exception 'Only admins can update orders' using errcode = '42501';
  end if;

  select status into current_status from public.orders where id = target for update;
  if current_status is null then
    raise exception 'Order not found';
  end if;
  if current_status = new_status then
    return;
  end if;
  if current_status = 'cancelled' then
    raise exception 'A cancelled order can''t be reopened';
  end if;

  if new_status = 'cancelled' then
    update public.product_variants v
    set stock_quantity = v.stock_quantity + i.quantity
    from public.order_items i
    where i.order_id = target and i.stock_tracked
      and v.product_id = i.product_id and v.id = i.variant_id
      and v.stock_quantity is not null;
  end if;

  update public.orders set status = new_status where id = target;
end;
$$;

revoke execute on function public.admin_set_order_status(uuid, public.order_status) from public, anon;
grant execute on function public.admin_set_order_status(uuid, public.order_status) to authenticated;
