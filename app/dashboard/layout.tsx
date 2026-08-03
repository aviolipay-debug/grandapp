import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./sign-out-button";

const navItems = [
  { href: "/dashboard", label: "Vue d'ensemble" },
  { href: "/dashboard/clients", label: "Clients" },
  { href: "/dashboard/quotes", label: "Devis" },
  { href: "/dashboard/invoices", label: "Factures" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="flex w-60 flex-col border-r border-paperline px-6 py-8">
        <Link href="/" className="font-display text-xl font-semibold text-ledger-deep">
          OliPay<span className="text-stamp">.</span>
        </Link>
        <nav className="mt-10 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-3 py-2 text-sm font-medium text-[#374151] hover:bg-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-8">
          <p className="mb-2 truncate text-xs text-[#6B7280]">{user.email}</p>
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 px-10 py-8">{children}</main>
    </div>
  );
}
