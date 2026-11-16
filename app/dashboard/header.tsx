// app/dashboard/header.tsx
"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Wallet, Users, FileText, UserCircle2, Heart } from "lucide-react";
import ThemeSwitch from "../components/theme-switch";
import Logo from "../components/logo";
import LoadingOverlay from "../components/loading-overlay";

// Pages principales du compte, préchargées dès l'arrivée sur le dashboard
// (connexion, inscription, ou retour de Google) pour que la navigation entre
// elles soit quasi instantanée ensuite.
//
// /dashboard/invoices n'est volontairement PAS préchargée : depuis la
// protection par code PIN, cette page est entièrement dynamique (elle lit un
// cookie de sécurité à chaque requête via cookies()), donc un prefetch()
// déclenche une vraie exécution serveur (authentification + requête Supabase)
// à chaque fois que ce header est monté, sans aucun gain réel pour
// l'utilisateur, ça ne faisait qu'ajouter des appels Supabase inutiles à
// chaque navigation dans le dashboard.
const MAIN_ROUTES = [
  "/dashboard",
  "/dashboard/clients",
  "/dashboard/quotes",
  "/dashboard/profile",
];

// Adresse de la page "Nous soutenir" (page de don, lien Mobile Money, etc.).
// Remplacez-la par votre vrai lien : le bouton s'ouvre dans un nouvel onglet.
const SUPPORT_URL = "#";

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
  const [isProfileNavPending, startProfileNav] = useTransition();

  // Précharge le contenu des pages principales dès que ce header est monté -
  // c'est-à-dire dès que l'utilisateur arrive sur une page du dashboard,
  // quel que soit le point d'entrée (connexion, inscription, OAuth).
  useEffect(() => {
    MAIN_ROUTES.forEach((href) => router.prefetch(href));
  }, [router]);

  // isProfileNavPending reste vrai jusqu'à ce que React ait fini de préparer
  // la page /dashboard/profile, contrairement à usePathname, qui change dès
  // le début de la navigation, avant que la nouvelle page soit prête.
  function handleProfileClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    startProfileNav(() => {
      router.push("/dashboard/profile");
    });
  }

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : !!pathname?.startsWith(href);

  return (
    <>
      <LoadingOverlay show={isProfileNavPending} message="Chargement du profil…" />

      {/* Header mobile : thème / logo centré / bouton Soutenir (la nav vit dans la bottom-nav) */}
      <header className="sticky top-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center border-b border-paperline bg-white px-[6vw] py-4 dark:border-white/10 dark:bg-[#2F2F2F] md:hidden">
        <div className="flex items-center">
          <ThemeSwitch />
        </div>
        <Link href="/dashboard" aria-label="Devisfinance" className="justify-self-center">
          <Logo size={24} />
        </Link>
        <div className="flex items-center justify-end">
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full px-2.5 py-2 text-xs font-semibold text-ink transition-colors hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
          >
            <Heart size={16} className="text-stamp" />
            Soutenir
          </a>
        </div>
      </header>

      {/* Menu latéral sombre (ordinateur), fixe à gauche, largeur 16rem.
          Les pages qui l'affichent doivent avoir "md:pl-64" sur leur conteneur. */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col justify-between bg-[#181818] px-5 py-7 text-white md:flex">
        <div className="flex flex-col gap-8">
          <Link href="/dashboard" aria-label="Devisfinance" className="px-1">
            <Logo size={34} variant="light" />
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
          </nav>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-[#D1D5DB] transition-colors hover:bg-white/10 hover:text-white"
          >
            <Heart size={18} className="text-stamp" />
            Nous soutenir
          </a>

          <Link
            href="/dashboard/profile"
            onClick={handleProfileClick}
            aria-current={isActive("/dashboard/profile") ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-sm font-semibold transition-colors ${
              isActive("/dashboard/profile")
                ? "border-ledger-deep bg-ledger-deep text-white"
                : "border-white/15 bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            <UserCircle2 size={20} />
            Profil
          </Link>
        </div>
      </aside>
    </>
  );
}
