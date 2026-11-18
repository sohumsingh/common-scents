import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { AdminNav, AdminNavList } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin | Common Scents" },
  robots: { index: false, follow: false },
};

/**
 * The admin area. Each page checks admin access itself (requireAdmin), so
 * the check runs on every request, and every admin action checks again.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-ivory py-[clamp(1.5rem,4svh,3rem)]">
      <Container>
        <p className="eyebrow flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-8 bg-gold" />
          Common Scents admin
        </p>
        <div className="mt-4">
          <Suspense fallback={<AdminNavList />}>
            <AdminNav />
          </Suspense>
        </div>
        <div className="mt-8">{children}</div>
      </Container>
    </div>
  );
}
