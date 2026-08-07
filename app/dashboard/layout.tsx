// app/dashboard/layout.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Users,
  FileText,
  Receipt,
  UserCircle2,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client"; // adapte le chemin si besoin

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Clients", href: "/dashboard/clients", icon: Users },
  { label: "Devis", href: "/dashboard/devis", icon: FileText },
  { label: "Factures", href: "/dashboard/factures", icon: Receipt },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#F7F8FB] dark:bg-[#2F2F2F] font-sans text-[#1C1C1C] dark:text-white">
      {/* Topbar mobile */}
      <div className="lg:hidden flex items-center justify-between px-4 h-16 bg-white dark:bg-[#262626] border-b border-black/5 dark:border-white/10 sticky top-0 z-30">
        <Link href="/dashboard" className="font-display font-bold text-lg">
          <span className="text-[#7D2AE7]">Oli</span>
          <span className="text-[#00C4CC]">Pay</span>
        </Link>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Ouvrir le menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar desktop */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:h-screen lg:sticky lg:top-0 bg-white dark:bg-[#262626] border-r border-black/5 dark:border-white/10 px-4 py-6">
          <Link
            href="/dashboard"
            className="font-display font-bold text-2xl px-2 mb-8"
          >
            <span className="text-[#7D2AE7]">Oli</span>
            <span className="text-[#00C4CC]">Pay</span>
          </Link>

          <nav className="flex-1 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-gradient-to-r from-[#7D2AE7] to-[#00C4CC] text-white shadow-sm shadow-[#7D2AE7]/20"
                      : "text-[#1C1C1C]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
                >
                  <Icon size={18} strokeWidth={2} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-col gap-1 pt-4 mt-4 border-t border-black/5 dark:border-white/10">
            <Link
              href="/dashboard/compte"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#1C1C1C]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <UserCircle2 size={18} strokeWidth={2} />
              Compte
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#FE6F61] hover:bg-[#FE6F61]/10 transition-colors"
            >
              <LogOut size={18} strokeWidth={2} />
              Déconnexion
            </button>
          </div>
        </aside>

        {/* Sidebar mobile (drawer) */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="relative w-64 bg-white dark:bg-[#262626] h-full px-4 py-6 flex flex-col">
              <nav className="flex-1 flex flex-col gap-1 mt-4">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#1C1C1C]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="flex flex-col gap-1 pt-4 border-t border-black/5 dark:border-white/10">
                <Link
                  href="/dashboard/compte"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
                >
                  <UserCircle2 size={18} />
                  Compte
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#FE6F61]"
                >
                  <LogOut size={18} />
                  Déconnexion
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Contenu */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
