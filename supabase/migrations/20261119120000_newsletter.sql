-- ---------------------------------------------------------------------------
-- Newsletter subscriptions
-- ---------------------------------------------------------------------------
-- Subscribing is a setting on the customer's own account, so the newsletter
-- always goes to the email they signed in with, and they can switch it off
-- from their account page. The time of the last change is kept as a record
-- of consent (POPIA).
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column newsletter_opt_in boolean not null default false,
  add column newsletter_updated_at timestamptz;

-- Customers may change these on their own profile (row-level security already
-- limits updates to their own row). Their role stays out of reach.
grant update (newsletter_opt_in, newsletter_updated_at) on public.profiles to authenticated;
