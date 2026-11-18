-- ---------------------------------------------------------------------------
-- Common Scents — customer accounts and the admin role
-- ---------------------------------------------------------------------------
-- Every sign-up gets a profile row automatically. A profile's role is either
-- 'customer' (the default) or 'admin'. Customers can read and edit their own
-- name, but never their role; roles are changed only by an admin or directly
-- in the database. Admins may edit the catalogue (for the admin dashboard).
-- ---------------------------------------------------------------------------

create type public.user_role as enum ('customer', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Create a profile whenever someone registers.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep the profile's email in step if the account email changes.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- True when the signed-in user is an admin. Security definer so policies can
-- use it without recursing through the profiles policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Profiles: row-level security and column privileges
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "People can read their own profile; admins read all" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy "People can update their own profile; admins update any" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));

-- Customers may only change their name. The role column stays out of reach
-- of the public API entirely; admins change roles through server code that
-- uses the secret key, or in the database.
revoke update on public.profiles from anon, authenticated;
grant update (full_name) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Catalogue: admins can see unpublished products and edit everything
-- ---------------------------------------------------------------------------
-- "for all" covers reading too, so admins also see unpublished products.
create policy "Admins manage products" on public.products
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage occasion tags" on public.product_occasions
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage sizes" on public.product_variants
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage brands" on public.brands
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage occasions" on public.occasions
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
