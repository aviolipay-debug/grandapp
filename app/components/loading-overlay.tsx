// app/components/loading-overlay.tsx
//
// Voile de chargement léger : fond semi-transparent et flou (la page reste
// devinable derrière), avec le logo Devisfinance qui pulse au centre.
// Utilisation inchangée : <LoadingOverlay show={loading} message="Chargement…" />
"use client";

import { LogoIcon } from "./logo";

export default function LoadingOverlay({
  show,
  message,
}: {
  show: boolean;
  message?: string;
}) {
  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[110] flex flex-col items-center justify-center gap-4 bg-white/65 backdrop-blur-md dark:bg-[#262626]/65"
    >
      <LogoIcon
        size={64}
        className="animate-pulse motion-reduce:animate-none"
      />
      {message ? (
        <p className="text-sm font-medium text-muted dark:text-white/70">{message}</p>
      ) : (
        <span className="sr-only">Chargement…</span>
      )}
    </div>
  );
}
