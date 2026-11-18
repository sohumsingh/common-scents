"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type AuthState = { status: "loading" } | { status: "signed-out" } | { status: "signed-in"; email: string };

/**
 * Whether the visitor is signed in, for browser components (header, bag).
 * Re-checks after every navigation, since signing in and out happen on the
 * server and arrive as a page change.
 *
 * For display only: anything that matters (checkout, the admin area) is
 * checked again on the server.
 */
export function useAuthUser(): AuthState {
  const pathname = usePathname();
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const email = data.session?.user.email;
      setState(data.session ? { status: "signed-in", email: email ?? "" } : { status: "signed-out" });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setState(session ? { status: "signed-in", email: session.user.email ?? "" } : { status: "signed-out" });
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [pathname]);

  return state;
}
