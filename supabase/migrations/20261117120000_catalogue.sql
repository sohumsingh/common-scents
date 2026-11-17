-- ---------------------------------------------------------------------------
-- Common Scents — catalogue schema
-- ---------------------------------------------------------------------------
-- Mirrors the storefront's domain types (src/lib/types.ts) so the seed
-- catalogue can move into PostgreSQL without changing any page.
--
-- Reading is public (only published products); writing is reserved for the
-- admin dashboard, whose policies arrive with the accounts migration.
-- ---------------------------------------------------------------------------

create type public.gender as enum ('men', 'women', 'unisex');
create type public.brand_family as enum ('designer', 'middle-eastern');
create type public.notes_status as enum ('verified', 'pending-verification');
create type public.pricing_status as enum ('confirmed', 'indicative');
create type public.stock_status as enum ('in-stock', 'low-stock', 'out-of-stock', 'pending-verification');
create type public.finder_character as enum ('fresh', 'woody', 'sweet', 'bold', 'floral');
create type public.finder_intensity as enum ('light', 'balanced', 'rich');
create type public.bottle_shape as enum ('flacon', 'classic', 'tall', 'orb', 'square');
create type public.cap_style as enum ('cylindrical', 'square', 'faceted');

-- Keeps updated_at current on every edit.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Occasions: the five collections.
-- ---------------------------------------------------------------------------
create table public.occasions (
  slug text primary key,
  name text not null,
  short_name text not null,
  tagline text not null,
  description text not null,
  question text not null,
  accent text not null,
  wash text not null,
  sort_order smallint not null,
  updated_at timestamptz not null default now()
);

create trigger occasions_touch before update on public.occasions
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Brands (houses).
-- ---------------------------------------------------------------------------
create table public.brands (
  slug text primary key,
  name text not null unique,
  family public.brand_family not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger brands_touch before update on public.brands
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Products (fragrances).
-- ---------------------------------------------------------------------------
create table public.products (
  id text primary key,
  slug text not null unique,
  brand_slug text not null references public.brands (slug) on update cascade,
  name text not null,
  full_name text not null,
  concentration text not null,
  gender public.gender not null,

  -- The list price; the size whose price matches is preselected on the page.
  price_zar integer not null check (price_zar >= 0),
  compare_at_price_zar integer check (compare_at_price_zar >= 0),

  short_description text not null,
  description text not null,
  character text[] not null default '{}',

  notes_top text[] not null default '{}',
  notes_heart text[] not null default '{}',
  notes_base text[] not null default '{}',

  notes_status public.notes_status not null default 'pending-verification',
  pricing_status public.pricing_status not null default 'indicative',
  stock_status public.stock_status not null default 'pending-verification',

  added_at date not null default current_date,
  editorial_badge text,

  -- Artwork used when no photograph is available, and the photo itself.
  visual_accent text not null,
  visual_glass text not null,
  visual_wash text not null,
  visual_shape public.bottle_shape not null,
  visual_cap public.cap_style not null,
  image_src text,
  image_alt text,

  -- Signature finder profile (editorial).
  finder_characters public.finder_character[] not null default '{}',
  finder_intensity public.finder_intensity not null default 'balanced',

  -- Wear guide (normalised community votes): seasons and day are 0–100.
  wear_winter smallint check (wear_winter between 0 and 100),
  wear_spring smallint check (wear_spring between 0 and 100),
  wear_summer smallint check (wear_summer between 0 and 100),
  wear_autumn smallint check (wear_autumn between 0 and 100),
  wear_day smallint check (wear_day between 0 and 100),
  wear_longevity_hours numeric(4, 1) check (wear_longevity_hours >= 0),

  -- Merchandising.
  is_published boolean not null default true,
  sort_order integer not null default 0,
  trending_rank smallint,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_brand_idx on public.products (brand_slug);
create index products_published_idx on public.products (is_published, sort_order);

create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- A fragrance can suit several occasions.
create table public.product_occasions (
  product_id text not null references public.products (id) on delete cascade on update cascade,
  occasion_slug text not null references public.occasions (slug) on update cascade,
  sort_order smallint not null default 0,
  primary key (product_id, occasion_slug)
);

create index product_occasions_occasion_idx on public.product_occasions (occasion_slug);

-- ---------------------------------------------------------------------------
-- Sizes (variants), each with its own price and stock.
-- ---------------------------------------------------------------------------
create table public.product_variants (
  product_id text not null references public.products (id) on delete cascade on update cascade,
  id text not null,
  label text not null,
  size text not null,
  price_zar integer not null check (price_zar >= 0),
  -- Null until the supplier confirms stock; the storefront treats null as "being confirmed".
  stock_quantity integer check (stock_quantity >= 0),
  sort_order smallint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (product_id, id)
);

create trigger product_variants_touch before update on public.product_variants
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row-level security: anyone may read the published catalogue; nobody may
-- write through the public API yet (admin policies come with accounts).
-- ---------------------------------------------------------------------------
alter table public.occasions enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_occasions enable row level security;
alter table public.product_variants enable row level security;

create policy "Occasions are public" on public.occasions
  for select using (true);

create policy "Brands are public" on public.brands
  for select using (true);

create policy "Published products are public" on public.products
  for select using (is_published);

create policy "Occasion tags of published products are public" on public.product_occasions
  for select using (
    exists (select 1 from public.products p where p.id = product_id and p.is_published)
  );

create policy "Sizes of published products are public" on public.product_variants
  for select using (
    exists (select 1 from public.products p where p.id = product_id and p.is_published)
  );
