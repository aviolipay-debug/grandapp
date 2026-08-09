// app/dashboard/header.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import ThemeToggle from "../theme-toggle";
import SignOutButton from "./sign-out-button";
import { createClient } from "@/lib/supabase/client"; // adapte le chemin si besoin

const NAV_ITEMS = [
  { label: "Accueil", href: "/dashboard" },
  { label: "Finance", href: "/dashboard/invoices" },
  { label: "Gestion", href: "/dashboard/clients" },
  { label: "Profil", href: "/onboarding" },
];

export default function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname?.startsWith(href);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Header mobile : toggle / logo centré / icône déconnexion (la nav vit dans la bottom-nav) */}
      <header className="sticky top-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center border-b border-paperline bg-white px-[6vw] py-4 dark:border-white/10 dark:bg-[#2F2F2F] md:hidden">
        <div className="flex items-center">
          <ThemeToggle />
        </div>
        <Link
          href="/dashboard"
          className="font-display justify-self-center text-2xl font-semibold text-ink dark:text-white"
        >
          OliPay<span className="text-stamp">.</span>
        </Link>
        <div className="flex items-center justify-end">
          <button
            onClick={handleSignOut}
            aria-label="Se déconnecter"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Header desktop : logo gauche, nav centre (Accueil/Finance/Gestion/Profil), déconnexion à droite */}
      <header className="sticky top-0 z-50 hidden items-center justify-between border-b border-paperline bg-paper px-[6vw] py-7 dark:border-white/10 dark:bg-[#2F2F2F] md:flex">
        <Link
          href="/dashboard"
          className="font-display text-2xl font-semibold text-ink dark:text-white"
        >
          OliPay<span className="text-stamp">.</span>
        </Link>
        <nav className="hidden gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-bold hover:text-ledger-deep dark:hover:text-ledger ${
                isActive(item.href)
                  ? "text-ledger-deep dark:text-ledger"
                  : "text-ink dark:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          <div className="w-36">
            <SignOutButton />
          </div>
        </div>
      </header>
    </>
  );
}
