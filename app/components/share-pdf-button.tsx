// app/components/share-pdf-button.tsx
// Bouton "Partager" d'un PDF : ouvre le menu de partage du téléphone (WhatsApp,
// Messages, Gmail, etc.) avec le fichier PDF en pièce jointe.
// Nécessaire dans l'application installée, dont le lecteur PDF n'a pas de menu de partage.
"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import Spinner from "./spinner";

export default function SharePdfButton({
  href,
  filename,
  variant = "icon",
  className = "",
}: {
  href: string;
  filename: string;
  variant?: "icon" | "full";
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const name = filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;

  async function share() {
    if (busy) return;
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch(href, { cache: "no-store" });
      if (!res.ok) throw new Error("fetch");
      const blob = await res.blob();
      const file = new File([blob], name, { type: "application/pdf" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: name });
      } else {
        // Partage de fichier impossible sur cet appareil : on télécharge le PDF.
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        setNote("Le partage n'est pas disponible ici, le PDF a été téléchargé.");
      }
    } catch (e) {
      // L'annulation du menu de partage par l'utilisateur n'est pas une erreur.
      if (!(e instanceof DOMException && e.name === "AbortError")) {
        setNote("Impossible de partager ce document. Réessayez.");
      }
    } finally {
      setBusy(false);
    }
  }

  const icon = busy ? <Spinner size={16} /> : <Share2 size={16} />;

  return (
    <>
      <button
        type="button"
        onClick={share}
        disabled={busy}
        aria-label={`Partager ${name}`}
        className={
          variant === "full"
            ? `mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-paperline px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-black/5 disabled:opacity-60 dark:border-white/15 dark:text-white dark:hover:bg-white/10 ${className}`
            : `flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ledger-deep transition-colors hover:bg-ledger-soft disabled:opacity-60 dark:text-ledger-light dark:hover:bg-white/10 ${className}`
        }
      >
        {icon}
        {variant === "full" && "Partager sur WhatsApp ou autre"}
      </button>
      {note && (
        <p role="status" className="mt-2 text-center text-xs text-[#6B7280] dark:text-white/50">
          {note}
        </p>
      )}
    </>
  );
}
