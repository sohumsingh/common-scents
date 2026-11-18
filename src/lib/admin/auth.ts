import "server-only";
import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

/**
 * Admin access. Every admin page and every admin action calls one of these
 * first; the database's own rules (row-level security) are the second wall,
 * so even a mistake here can't let a non-admin change the catalogue.
 */

async function adminContext() {
  const user = await getCurrentUser();
  if (!user) return { user: null, supabase: null, isAdmin: false } as const;

  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();
  return { user: { ...user, fullName: data?.full_name ?? "" }, supabase, isAdmin: data?.role === "admin" } as const;
}

/** For pages: sends visitors to sign in, and non-admins home. */
export async function requireAdmin() {
  const context = await adminContext();
  if (!context.user) redirect("/account/sign-in?next=/admin");
  if (!context.isAdmin) redirect("/account");
  return { user: context.user, supabase: context.supabase! };
}

/** For server actions: throws instead of redirecting. */
export async function assertAdmin() {
  const context = await adminContext();
  if (!context.user || !context.isAdmin) throw new Error("Admin access required.");
  return { user: context.user, supabase: context.supabase! };
}
