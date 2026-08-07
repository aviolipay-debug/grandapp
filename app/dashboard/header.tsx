// app/dashboard/header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "../theme-toggle";
import SignOutButton from "./sign-out-button";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Clients", href: "/dashboard/clients" },
  { label: "Devis", href: "/dashboard/quotes" },
  { label: "Factures", href: "/dashboard/invoices" },
];

export default function DashboardHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname?.startsWith(href);

  return (
    <>
      {/* Header mobile : même structure que la landing (toggle / logo centré / menu) */}
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
            onClick={() => setOpen((v) => !v)}
            aria-label="Ouvrir le menu"
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5"
          >
            <span
              className={`block h-0.5 w-6 bg-ink transition-transform dark:bg-white ${
                open ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-ink transition-opacity dark:bg-white ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-ink transition-transform dark:bg-white ${
                open ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </header>

      {/* Panneau mobile déroulant */}
      {open && (
        <div className="border-b border-paperline bg-white px-[6vw] py-4 dark:border-white/10 dark:bg-[#2F2F2F] md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-bold ${
                  isActive(item.href)
                    ? "bg-[#F3EEFC] text-ledger-deep dark:bg-white/10 dark:text-white"
                    : "text-ink dark:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/onboarding"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-bold text-ink dark:text-white"
            >
              Compte
            </Link>
          </nav>
          <div className="mt-3">
            <SignOutButton />
          </div>
        </div>
      )}

      {/* Header desktop : structure identique à la landing (logo gauche, nav centre, CTA droite) */}
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
          <Link
            href="/onboarding"
            className="rounded-lg border-[1.5px] border-ledger-deep px-6 py-3 text-sm font-semibold text-ledger-deep hover:bg-ledger-deep hover:text-white dark:border-white dark:text-white"
          >
            Compte
          </Link>
          <div className="w-36">
            <SignOutButton />
          </div>
        </div>
      </header>
    </>
  );
}
