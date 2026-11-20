-- ---------------------------------------------------------------------------
-- Common Scents — contact enquiries
-- ---------------------------------------------------------------------------
-- Messages sent through the contact form. Anyone may send one (signed in or
-- not) through submit_enquiry(), which checks the input and limits how often
-- one address can write. Only admins can read them or mark them as replied.
-- ---------------------------------------------------------------------------

create type public.enquiry_status as enum ('new', 'replied');

create sequence public.enquiry_number_seq start 1001;

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('MSG-' || nextval('public.enquiry_number_seq')),
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  email text not null,
  subject text not null,
  order_reference text,
  message text not null,
  status public.enquiry_status not null default 'new',
  created_at timestamptz not null default now(),
  replied_at timestamptz
);

create index enquiries_status_created_idx on public.enquiries (status, created_at desc);
create index enquiries_email_created_idx on public.enquiries (lower(email), created_at desc);

alter table public.enquiries enable row level security;

create policy "Admins read enquiries" on public.enquiries
  for select to authenticated
  using ((select private.is_admin()));

create policy "Admins update enquiries" on public.enquiries
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- Nobody writes rows directly; admins may only change the status fields.
revoke insert, update, delete on public.enquiries from anon, authenticated;
grant update (status, replied_at) on public.enquiries to authenticated;

-- ---------------------------------------------------------------------------
-- submit_enquiry: the contact form
-- ---------------------------------------------------------------------------
-- Problems are raised with a short code as the message for the site to
-- explain. Returns the new enquiry's reference.
create or replace function public.submit_enquiry(
  p_name text,
  p_email text,
  p_subject text,
  p_order_reference text,
  p_message text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_email text := lower(trim(coalesce(p_email, '')));
  new_reference text;
begin
  if length(trim(coalesce(p_name, ''))) not between 2 and 120
     or clean_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'
     or length(clean_email) > 254
     or coalesce(p_subject, '') not in (
       'Product enquiry', 'Order enquiry', 'Delivery question', 'Returns and refunds', 'Something else'
     )
     or length(trim(coalesce(p_message, ''))) not between 15 and 2000
     or length(coalesce(p_order_reference, '')) > 40 then
    raise exception 'invalid_enquiry';
  end if;

  -- At most 3 messages from one address in 10 minutes.
  if (
    select count(*) from public.enquiries
    where lower(email) = clean_email and created_at > now() - interval '10 minutes'
  ) >= 3 then
    raise exception 'too_many_enquiries';
  end if;

  insert into public.enquiries (user_id, name, email, subject, order_reference, message)
  values (
    (select auth.uid()),
    trim(p_name),
    clean_email,
    p_subject,
    nullif(trim(coalesce(p_order_reference, '')), ''),
    trim(p_message)
  )
  returning reference into new_reference;

  return new_reference;
end;
$$;

revoke execute on function public.submit_enquiry(text, text, text, text, text) from public;
grant execute on function public.submit_enquiry(text, text, text, text, text) to anon, authenticated;
