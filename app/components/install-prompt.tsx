// app/components/install-prompt.tsx
// Popup "Installer l'application", affiché sur /login, /signup et /dashboard.
// - Android / ordinateur (Chrome, Edge) : bouton Installer (invite native).
// - iPhone / iPad : le navigateur ne le permet pas, on explique les 2 gestes.
// Ne s'affiche pas si l'application est déjà installée, et se tait 3 jours
// après un "Plus tard".
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Share, SquarePlus, X } from "lucide-react";
import { LogoIcon } from "./logo";

const DISMISS_KEY = "devisfinance-install-dismissed";
const DISMISS_DAYS = 3;

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  const ua = navigator.userAgent;
  return (
    /iphone|ipad|ipod/i.test(ua) ||
    (ua.includes("Macintosh") && navigator.maxTouchPoints > 1)
  );
}

function recentlyDismissed() {
  try {
    const t = Number(localStorage.getItem(DISMISS_KEY));
    return t > 0 && Date.now() - t < DISMISS_DAYS * 86400000;
  } catch {
    return false;
  }
}

export default function InstallPrompt() {
  const pathname = usePathname();
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [show, setShow] = useState(false);

  const eligiblePage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/dashboard");

  // Service worker + écoute de l'invite d'installation (une seule fois).
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    if (isStandalone()) return;
    setIos(isIos());

    const onBefore = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      setShow(false);
    };
    window.addEventListener("beforeinstallprompt", onBefore);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBefore);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Affichage après un court délai, sur les pages concernées seulement.
  useEffect(() => {
    if (!eligiblePage || isStandalone() || recentlyDismissed()) {
      setShow(false);
      return;
    }
    if (!deferred && !ios) return;
    const t = setTimeout(() => setShow(true), 2500);
    return () => clearTimeout(t);
  }, [eligiblePage, deferred, ios]);

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Stockage indisponible : le popup reviendra à la prochaine visite.
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => null);
    setDeferred(null);
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[110] mx-auto max-w-sm md:inset-x-auto md:right-6 md:bottom-6 md:mx-0">
      <div
        role="dialog"
        aria-labelledby="install-title"
        className="relative rounded-2xl border border-paperline bg-white p-5 shadow-[0_10px_30px_-12px_rgba(14,19,24,0.35)] dark:border-white/10 dark:bg-[#262626]"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fermer"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          <LogoIcon size={44} className="shrink-0" />
          <div>
            <h2
              id="install-title"
              className="font-display text-base font-bold text-ink dark:text-white"
            >
              Installer Devisfinance
            </h2>
            <p className="mt-1 text-sm text-muted dark:text-white/60">
              Installez l&apos;application pour gérer vos devis et factures plus vite.
            </p>
          </div>
        </div>

        {deferred ? (
          <div className="mt-4 flex gap-2.5">
            <button
              type="button"
              onClick={install}
              className="flex-1 rounded-xl bg-ledger-deep px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ledger-dark"
            >
              Installer
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10"
            >
              Plus tard
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <ol className="space-y-2 text-sm text-ink dark:text-white/80">
              <li className="flex items-center gap-2.5">
                <Share size={18} className="shrink-0 text-ledger-deep dark:text-ledger-light" />
                <span>
                  Touchez <strong>Partager</strong> dans la barre du navigateur
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <SquarePlus size={18} className="shrink-0 text-ledger-deep dark:text-ledger-light" />
                <span>
                  Choisissez <strong>Sur l&apos;écran d&apos;accueil</strong>
                </span>
              </li>
            </ol>
            <button
              type="button"
              onClick={dismiss}
              className="mt-4 w-full rounded-xl bg-ledger-deep px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ledger-dark"
            >
              Compris
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
