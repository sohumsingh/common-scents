"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

/**
 * Account actions: sign in, register, password reset, profile and sign out.
 * Each runs on the server; passwords go straight to Supabase Auth and are
 * never stored or logged here.
 */

export type FormState = {
  /** A problem to show above the form. */
  error?: string;
  /** A success message (e.g. "check your email"). */
  message?: string;
  /** Values to put back into the form after an error (never the password). */
  values?: Record<string, string>;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Only allow returning to a page on this site. */
function safeNext(value: FormDataEntryValue | null, fallback = "/account"): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

async function siteOrigin(): Promise<string> {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/** Friendlier wording for the errors people actually hit. */
function explain(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "That email and password don't match an account.";
  if (m.includes("email not confirmed")) return "Please confirm your email first — the link is in the email we sent you.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Please wait a minute and try again.";
  if (m.includes("password") && m.includes("weak")) return "Please choose a stronger password.";
  if (m.includes("same password")) return "Your new password must be different from your current one.";
  if (m.includes("email address") && m.includes("invalid")) return "Please use a real email address you can receive mail at.";
  if (m.includes("not authorized") || m.includes("sending confirmation") || m.includes("sending recovery")) {
    return "We couldn't send the confirmation email just now. Please try again later or contact us.";
  }
  return "Something went wrong. Please try again.";
}

function passwordProblem(password: string): string | null {
  if (password.length < 8) return "Your password needs at least 8 characters.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "Use at least one letter and one number in your password.";
  return null;
}

export async function signIn(_state: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!EMAIL.test(email) || !password) {
    return { error: "Enter your email address and password.", values: { email } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: explain(error.message), values: { email } };

  redirect(next);
}

export async function register(_state: FormState, formData: FormData): Promise<FormState> {
  const fullName = text(formData, "fullName");
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const consent = formData.get("consent") === "on";
  const next = safeNext(formData.get("next"));
  const values = { fullName, email };

  if (!fullName) return { error: "Please tell us your name.", values };
  if (!EMAIL.test(email)) return { error: "Please enter a valid email address.", values };
  const weak = passwordProblem(password);
  if (weak) return { error: weak, values };
  if (password !== confirm) return { error: "Those passwords don't match.", values };
  if (!consent) return { error: "Please agree to the privacy policy to create an account.", values };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${await siteOrigin()}/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return { error: explain(error.message), values };

  // Email confirmation off: signed in straight away.
  if (data.session) redirect(next);

  // Confirmation on (or the address is already registered — we don't say
  // which, so nobody can use this form to find out who has an account).
  return {
    message: `Nearly there — we've sent a confirmation link to ${email}. Open it to activate your account, then sign in.`,
  };
}

export async function requestPasswordReset(_state: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email").toLowerCase();
  if (!EMAIL.test(email)) return { error: "Please enter a valid email address.", values: { email } };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteOrigin()}/auth/confirm?next=/account/reset-password`,
  });

  // Same reply whether or not the account exists.
  return { message: `If an account exists for ${email}, a link to reset your password is on its way.` };
}

export async function updatePassword(_state: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!(await getCurrentUser())) {
    return { error: "This reset link has expired. Please request a new one." };
  }
  const weak = passwordProblem(password);
  if (weak) return { error: weak };
  if (password !== confirm) return { error: "Those passwords don't match." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: explain(error.message) };

  redirect("/account?updated=password");
}

export async function updateProfile(_state: FormState, formData: FormData): Promise<FormState> {
  const fullName = text(formData, "fullName");
  const user = await getCurrentUser();
  if (!user) redirect("/account/sign-in?next=/account");
  if (!fullName) return { error: "Please enter your name.", values: { fullName } };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
  if (error) return { error: "We couldn't save that. Please try again.", values: { fullName } };

  return { message: "Saved.", values: { fullName } };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/* ------------------------------------------------------------------------ */
/* Newsletter                                                               */
/* ------------------------------------------------------------------------ */

export type NewsletterState = { subscribed?: boolean; error?: string };

/**
 * Subscribe or unsubscribe the signed-in customer. The newsletter only ever
 * goes to the account's own email, so there is no address to type in.
 */
export async function setNewsletter(_state: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to manage your newsletter subscription." };

  const subscribe = formData.get("subscribe") === "1";
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ newsletter_opt_in: subscribe, newsletter_updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) return { error: "We couldn't save that. Please try again." };
  return { subscribed: subscribe };
}
