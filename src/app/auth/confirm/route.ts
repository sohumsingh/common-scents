import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Where links in Supabase emails land (confirm sign-up, reset password).
 * Exchanges the one-time token for a session, then continues to `next`.
 * Handles both email styles: `token_hash` + `type`, and the default `code`.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/account";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/account";

  const supabase = await createClient();
  let ok = false;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ok = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  }

  const destination = request.nextUrl.clone();
  destination.search = "";
  if (ok) {
    const target = new URL(next, request.url);
    destination.pathname = target.pathname;
    target.searchParams.forEach((value, key) => destination.searchParams.set(key, value));
  } else {
    destination.pathname = "/account/sign-in";
    destination.searchParams.set("error", "link");
  }
  return NextResponse.redirect(destination);
}
