// app/dashboard/header.tsx
"use client";

import { useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, ChevronDown } from "lucide-react";
import ThemeToggle from "../theme-toggle";
import SignOutButton from "./sign-out-button";
import { createClient } from "@/lib/supabase/client"; // adapte le chemin si besoin
import { vastron } from "@/lib/fonts/vastron"; // police sur-mesure du logo
import LoadingOverlay from "../components/loading-overlay";

export default function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isProfileNavPending, startProfileNav] = useTransition();

  // isProfileNavPending reste vrai jusqu'à ce que React ait fini de préparer
  // la page /dashboard/profile — contrairement à usePathname, qui change dès
  // le début de la navigation, avant que la nouvelle page soit prête.
  function handleProfileClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    startProfileNav(() => {
      router.push("/dashboard/profile");
    });
  }

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname?.startsWith(href);

  const isGestionActive =
    pathname?.startsWith("/dashboard/clients") ||
    pathname?.startsWith("/dashboard/quotes");

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <LoadingOverlay show={isProfileNavPending} message="Chargement du profil…" />

      {/* Header mobile : toggle / logo centré / icône déconnexion (la nav vit dans la bottom-nav) */}
      <header className="sticky top-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center border-b border-paperline bg-white px-[6vw] py-4 dark:border-white/10 dark:bg-[#2F2F2F] md:hidden">
        <div className="flex items-center">
          <ThemeToggle />
        </div>
        <Link
          href="/dashboard"
          className={`${vastron.className} justify-self-center text-2xl font-semibold text-ink dark:text-white`}
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
      <header className="sticky top-0 z-50 hidden items-center justify-between border-b border-paperline bg-paper px-[6vw] py-8 dark:border-white/10 dark:bg-[#2F2F2F] md:flex">
        <Link
          href="/dashboard"
          className={`${vastron.className} text-2xl font-semibold text-ink dark:text-white`}
        >
          OliPay<span className="text-stamp">.</span>
        </Link>

        <nav className="hidden items-center gap-14 md:flex">
          <Link
            href="/dashboard"
            className={`text-lg font-bold hover:text-ledger-deep dark:hover:text-ledger ${
              pathname === "/dashboard"
                ? "text-ledger-deep dark:text-ledger"
                : "text-ink dark:text-white"
            }`}
          >
            Accueil
          </Link>

          <Link
            href="/dashboard/invoices"
            className={`text-lg font-bold hover:text-ledger-deep dark:hover:text-ledger ${
              isActive("/dashboard/invoices")
                ? "text-ledger-deep dark:text-ledger"
                : "text-ink dark:text-white"
            }`}
          >
            Finances
          </Link>

          {/* Gestion — menu déroulant Clients / Devis */}
          <div className="group relative py-2">
            <button
              type="button"
              className={`flex items-center gap-2 text-lg font-bold hover:text-ledger-deep dark:hover:text-ledger ${
                isGestionActive
                  ? "text-ledger-deep dark:text-ledger"
                  : "text-ink dark:text-white"
              }`}
            >
              Gestion
              <ChevronDown
                size={18}
                className="transition-transform group-hover:rotate-180"
              />
            </button>

            <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
              <div className="min-w-[160px] overflow-hidden rounded-xl border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-[#262626]">
                <Link
                  href="/dashboard/clients"
                  className="block px-5 py-3 text-sm font-semibold text-ink hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
                >
                  Clients
                </Link>
                <Link
                  href="/dashboard/quotes"
                  className="block px-5 py-3 text-sm font-semibold text-ink hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
                >
                  Devis
                </Link>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/profile"
            onClick={handleProfileClick}
            className={`text-lg font-bold hover:text-ledger-deep dark:hover:text-ledger ${
              isActive("/dashboard/profile")
                ? "text-ledger-deep dark:text-ledger"
                : "text-ink dark:text-white"
            }`}
          >
            Profil
          </Link>
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
