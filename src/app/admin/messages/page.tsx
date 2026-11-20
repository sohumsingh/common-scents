import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { setEnquiryStatus } from "../actions";
import { AdminHeader, AdminSkeleton, Pill } from "@/components/admin/AdminUI";

export const metadata: Metadata = { title: "Messages" };

const received = new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

type Enquiry = {
  id: string;
  reference: string;
  name: string;
  email: string;
  subject: string;
  order_reference: string | null;
  message: string;
  status: "new" | "replied";
  created_at: string;
  replied_at: string | null;
};

const FILTERS = [
  { value: "new", label: "New" },
  { value: "replied", label: "Replied" },
  { value: "all", label: "All" },
] as const;

function replyLink(enquiry: Enquiry) {
  const subject = `Re: ${enquiry.subject} (${enquiry.reference})`;
  const body = `Hi ${enquiry.name.split(" ")[0]},\n\n\n\n— Common Scents\n\n> ${enquiry.message.split("\n").join("\n> ")}`;
  return `mailto:${enquiry.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

async function Messages({ searchParams }: { searchParams: PageProps<"/admin/messages">["searchParams"] }) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const filter = FILTERS.find((option) => option.value === params.show)?.value ?? "new";

  let query = supabase
    .from("enquiries")
    .select("id, reference, name, email, subject, order_reference, message, status, created_at, replied_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (filter !== "all") query = query.eq("status", filter);
  const [{ data }, { count: newCount }] = await Promise.all([
    query,
    supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);
  const enquiries = (data ?? []) as Enquiry[];
  const back = `/admin/messages?show=${filter}`;

  return (
    <div className="flex flex-col gap-5">
      {typeof params.error === "string" ? (
        <p role="alert" className="border border-red-800/25 bg-red-800/[0.04] px-4 py-3 text-[14px] text-red-900">
          {params.error}
        </p>
      ) : null}

      <nav aria-label="Filter messages" className="flex flex-wrap gap-2">
        {FILTERS.map((option) => {
          const active = option.value === filter;
          return (
            <Link
              key={option.value}
              href={`/admin/messages?show=${option.value}`}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-[12px] transition-colors ${
                active ? "border-charcoal bg-charcoal text-ivory" : "border-line bg-paper text-stone hover:border-charcoal/40 hover:text-charcoal"
              }`}
            >
              {option.label}
              {option.value === "new" && (newCount ?? 0) > 0 ? (
                <span className={`rounded-full px-1.5 text-[11px] tabular-nums ${active ? "bg-ivory/20" : "bg-gold/15 text-gold-deep"}`}>
                  {newCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {enquiries.length === 0 ? (
        <p className="border border-line bg-paper px-5 py-8 text-center text-[14px] text-stone">
          {filter === "new"
            ? "No new messages. Anything sent through the contact form appears here."
            : filter === "replied"
              ? "No replied messages yet."
              : "No messages yet. Anything sent through the contact form appears here."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {enquiries.map((enquiry) => (
            <li key={enquiry.id} className="border border-line bg-paper">
              <details className="group" open={filter === "new" && enquiries.length <= 5}>
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-4 hover:bg-parchment/30 [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] text-charcoal">{enquiry.name}</span>
                      {enquiry.status === "new" ? <Pill tone="warn">New</Pill> : <Pill tone="good">Replied</Pill>}
                    </span>
                    <span className="mt-0.5 block text-[13px] text-stone">
                      {enquiry.subject}
                      {enquiry.order_reference ? ` · ${enquiry.order_reference}` : ""}
                    </span>
                  </span>
                  <span className="flex items-center gap-3 text-[12px] text-muted">
                    <span className="font-mono">{enquiry.reference}</span>
                    {received.format(new Date(enquiry.created_at))}
                    <span aria-hidden="true" className="transition-transform group-open:rotate-180">
                      ▾
                    </span>
                  </span>
                </summary>

                <div className="border-t border-line px-5 py-5">
                  <p className="text-[13px] text-stone">
                    From <span className="text-charcoal">{enquiry.email}</span>
                  </p>
                  <p className="mt-4 whitespace-pre-wrap text-[14px] leading-relaxed text-charcoal">{enquiry.message}</p>

                  <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4">
                    <a
                      href={replyLink(enquiry)}
                      className="inline-flex min-h-11 items-center bg-charcoal px-5 text-[11px] uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-noir"
                    >
                      Reply by email
                    </a>
                    <form action={setEnquiryStatus}>
                      <input type="hidden" name="id" value={enquiry.id} />
                      <input type="hidden" name="back" value={back} />
                      <input type="hidden" name="status" value={enquiry.status === "new" ? "replied" : "new"} />
                      <button
                        type="submit"
                        className="inline-flex min-h-11 items-center border border-charcoal/25 px-5 text-[11px] uppercase tracking-[0.16em] text-charcoal transition-colors hover:border-charcoal hover:bg-charcoal hover:text-ivory"
                      >
                        {enquiry.status === "new" ? "Mark as replied" : "Mark as new"}
                      </button>
                    </form>
                    {enquiry.replied_at ? (
                      <span className="text-[12px] text-muted">Replied {received.format(new Date(enquiry.replied_at))}</span>
                    ) : null}
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function MessagesPage(props: PageProps<"/admin/messages">) {
  return (
    <div className="flex flex-col gap-8">
      <AdminHeader
        title="Messages"
        description="Everything sent through the contact form. Reply by email, then mark the message as replied so it leaves the New list."
      />
      <Suspense fallback={<AdminSkeleton rows={5} />}>
        <Messages searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
