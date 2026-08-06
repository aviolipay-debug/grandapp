"use client";

import { useState } from "react";

const links = [
  { href: "#top", label: "Accueil" },
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#cibles", label: "Pour qui" },
  { href: "#faq", label: "FAQ" },
  { href: "mailto:", label: "Contactez-nous" },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center text-white"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M1 1L17 17M17 1L1 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <path
              d="M1 1H17M1 7H17M1 13H17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full border-b border-paperline bg-paper px-[6vw] py-4 shadow-lg">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded px-3 py-3 text-sm font-medium text-ink hover:bg-white"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
