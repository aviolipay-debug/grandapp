// app/dashboard/header.tsx
"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Home, Wallet, Users, FileText, UserCircle2 } from "lucide-react";
import ThemeToggle from "../theme-toggle";
import { createClient } from "@/lib/supabase/client"; // adapte le chemin si besoin
import { vastron } from "@/lib/fonts/vastron"; // police sur-mesure du logo
import LoadingOverlay from "../components/loading-overlay";

// Pages principales du compte — préchargées dès l'arrivée sur le dashboard
// (connexion, inscription, ou retour de Google) pour que la navigation entre
// elles soit quasi instantanée ensuite.
//
// /dashboard/invoices n'est volontairement PAS préchargée : depuis la
// protection par code PIN, cette page est entièrement dynamique (elle lit un
// cookie de sécurité à chaque requête via cookies()), donc un prefetch()
// déclenche une vraie exécution serveur (authentification + requête Supabase)
// à chaque fois que ce header est monté, sans aucun gain réel pour
// l'utilisateur — ça ne faisait qu'ajouter des appels Supabase inutiles à
// chaque navigation dans le dashboard.
const MAIN_ROUTES = [
  "/dashboard",
  "/dashboard/clients",
  "/dashboard/quotes",
  "/dashboard/profile",
];

// Lien du menu latéral (ordinateur) : l'élément actif est plein violet,
// les autres sont gris clair avec un léger survol.
function SideLink({
  href,
  label,
  icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors ${
        active
          ? "bg-ledger-deep text-white"
          : "text-[#D1D5DB] hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

export default function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isProfileNavPending, startProfileNav] = useTransition();

  // Précharge le contenu des pages principales dès que ce header est monté —
  // c'est-à-dire dès que l'utilisateur arrive sur une page du dashboard,
  // quel que soit le point d'entrée (connexion, inscription, OAuth).
  useEffect(() => {
    MAIN_ROUTES.forEach((href) => router.prefetch(href));
  }, [router]);

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
    href === "/dashboard" ? pathname === href : !!pathname?.startsWith(href);

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
          Devisfinance<span className="text-ledger-deep dark:text-ledger-light">.</span>
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

      {/* Menu latéral sombre (ordinateur) — fixe à gauche, largeur 16rem.
          Les pages qui l'affichent doivent avoir "md:pl-64" sur leur conteneur. */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col justify-between bg-[#181818] px-5 py-7 text-white md:flex">
        <div className="flex flex-col gap-8">
          <Link
            href="/dashboard"
            className={`${vastron.className} px-1 text-2xl font-semibold text-white`}
          >
            Devisfinance<span className="text-ledger-light">.</span>
          </Link>

          <nav className="flex flex-col gap-1.5" aria-label="Navigation principale">
            <SideLink
              href="/dashboard"
              label="Accueil"
              icon={<Home size={18} />}
              active={pathname === "/dashboard"}
            />
            <SideLink
              href="/dashboard/invoices"
              label="Finances"
              icon={<Wallet size={18} />}
              active={isActive("/dashboard/invoices")}
            />

            <p className="mt-5 mb-1 px-3.5 text-[11px] font-semibold uppercase tracking-wider text-white/55">
              Gestion
            </p>
            <SideLink
              href="/dashboard/clients"
              label="Clients"
              icon={<Users size={18} />}
              active={isActive("/dashboard/clients")}
            />
            <SideLink
              href="/dashboard/quotes"
              label="Devis"
              icon={<FileText size={18} />}
              active={isActive("/dashboard/quotes")}
            />

            <p className="mt-5 mb-1 px-3.5 text-[11px] font-semibold uppercase tracking-wider text-white/55">
              Compte
            </p>
            <SideLink
              href="/dashboard/profile"
              label="Profil"
              icon={<UserCircle2 size={18} />}
              active={isActive("/dashboard/profile")}
              onClick={handleProfileClick}
            />
          </nav>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-[#D1D5DB] transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut size={18} />
          Se déconnecter
        </button>
      </aside>
    </>
  );
}
