import { Suspense } from "react";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { setRole } from "../actions";
import { AdminHeader, AdminSkeleton, Pill } from "@/components/admin/AdminUI";

export const metadata: Metadata = { title: "Customers" };

const joined = new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short", year: "numeric" });

async function Customers({ searchParams }: { searchParams: PageProps<"/admin/customers">["searchParams"] }) {
  const { supabase, user } = await requireAdmin();
  const [{ data }, params] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, role, created_at, newsletter_opt_in").order("created_at", { ascending: false }),
    searchParams,
  ]);
  const people = data ?? [];

  return (
    <div className="flex flex-col gap-6">
      {typeof params.error === "string" ? (
        <p role="alert" className="border border-red-800/25 bg-red-800/[0.04] px-4 py-3 text-[14px] text-red-900">
          {params.error}
        </p>
      ) : params.updated ? (
        <p role="status" className="border border-emerald-800/20 bg-emerald-800/[0.05] px-4 py-3 text-[14px] text-emerald-900">
          Access updated.
        </p>
      ) : null}

      <div className="overflow-x-auto border border-line bg-paper">
        <table className="w-full min-w-[48rem] text-left text-[14px]">
          <thead className="border-b border-line text-[11px] uppercase tracking-[0.14em] text-stone">
            <tr>
              <th className="px-4 py-3 font-normal">Name</th>
              <th className="px-4 py-3 font-normal">Email</th>
              <th className="px-4 py-3 font-normal">Joined</th>
              <th className="px-4 py-3 font-normal">Newsletter</th>
              <th className="px-4 py-3 font-normal">Access</th>
              <th className="px-4 py-3 font-normal" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {people.map((person) => {
              const isYou = person.id === user.id;
              const isAdmin = person.role === "admin";
              return (
                <tr key={person.id}>
                  <td className="px-4 py-3 text-charcoal">
                    {person.full_name || "—"}
                    {isYou ? <span className="ml-2 text-[12px] text-muted">(you)</span> : null}
                  </td>
                  <td className="px-4 py-3 text-stone">{person.email}</td>
                  <td className="px-4 py-3 text-stone">{joined.format(new Date(person.created_at))}</td>
                  <td className="px-4 py-3">{person.newsletter_opt_in ? <Pill tone="good">Subscribed</Pill> : <span className="text-[12px] text-muted">—</span>}</td>
                  <td className="px-4 py-3">{isAdmin ? <Pill tone="warn">Admin</Pill> : <Pill>Customer</Pill>}</td>
                  <td className="px-4 py-3 text-right">
                    {isYou ? null : (
                      <form action={setRole}>
                        <input type="hidden" name="id" value={person.id} />
                        <input type="hidden" name="role" value={isAdmin ? "customer" : "admin"} />
                        <button type="submit" className="min-h-11 text-[12px] text-charcoal underline decoration-gold/60 underline-offset-4 hover:decoration-charcoal">
                          {isAdmin ? "Remove admin access" : "Make admin"}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CustomersPage(props: PageProps<"/admin/customers">) {
  return (
    <div className="flex flex-col gap-8">
      <AdminHeader
        title="Customers"
        description="Everyone who has registered. Admins can manage the catalogue and other admins; you can't remove your own admin access."
      />
      <Suspense fallback={<AdminSkeleton rows={6} />}>
        <Customers searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
