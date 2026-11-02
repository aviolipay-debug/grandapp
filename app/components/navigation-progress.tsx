// app/components/navigation-progress.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Fine barre violette en haut de l'écran pendant un changement de page.
 *
 * - Démarre au clic sur un lien interne qui mène vers une autre page.
 * - Avance doucement jusqu'à ~85 %, puis se termine dès que la nouvelle page
 *   est affichée (changement de pathname).
 * - Ne cache rien : la page actuelle reste visible et utilisable.
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimers() {
    if (trickleRef.current) clearInterval(trickleRef.current);
    if (safetyRef.current) clearTimeout(safetyRef.current);
    if (hideRef.current) clearTimeout(hideRef.current);
    trickleRef.current = safetyRef.current = hideRef.current = null;
  }

  function finish() {
    clearTimers();
    setProgress(100);
    hideRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
  }

  function start() {
    clearTimers();
    setVisible(true);
    setProgress(12);
    trickleRef.current = setInterval(() => {
      // Avance de moins en moins vite, sans jamais dépasser 85 %.
      setProgress((p) => (p < 85 ? p + (85 - p) * 0.12 : p));
    }, 250);
    // Sécurité : si la navigation n'aboutit pas, la barre disparaît seule.
    safetyRef.current = setTimeout(finish, 12000);
  }

  // Nouvelle page affichée → on termine la barre.
  useEffect(() => {
    if (visible) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Clic sur un lien interne vers une autre page → on démarre la barre.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented && !(e.target as HTMLElement)?.closest?.("a")) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;
      start();
    }
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-full origin-left bg-ledger-deep shadow-[0_0_8px_rgba(125,42,231,0.6)] transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  );
}
