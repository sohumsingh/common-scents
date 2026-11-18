-- The account trigger functions run only inside the database; nobody should
-- call them through the API. The admin check moves to a private schema the
-- API does not expose (policies keep working: they reference the function
-- itself, not its name).
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_user_email_change() from public, anon, authenticated;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
alter function public.is_admin() set schema private;
revoke execute on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;
