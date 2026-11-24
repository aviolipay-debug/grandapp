// app/components/external-pdf-links.tsx
// Dans l'application installée sur Android, ouvre les PDF (devis, factures,
// bordereaux, reçus) dans Chrome plutôt que dans le lecteur intégré, qui n'a pas
// de menu de partage (WhatsApp, etc.). N'a aucun effet dans un navigateur normal.
// Sur iPhone, l'application installée n'a pas de moyen d'ouvrir Safari : rien ne change.
"use client";

import { useEffect } from "react";

const PDF_PATH = /^\/api\/(quotes|invoices|payments)\/[^/]+\/pdf\/?$/;

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export default function ExternalPdfLinks() {
  useEffect(() => {
    if (!/android/i.test(navigator.userAgent) || !isStandalone()) return;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      const anchor = (e.target as Element | null)?.closest?.("a");
      if (!anchor) return;

      let url: URL;
      try {
        url = new URL(anchor.getAttribute("href") ?? "", window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin || !PDF_PATH.test(url.pathname)) return;

      e.preventDefault();
      // Lance Chrome sur cette adresse. Si Chrome est introuvable, on ouvre
      // le lien normalement grâce à browser_fallback_url.
      const scheme = url.protocol.replace(":", "");
      window.location.href =
        `intent://${url.host}${url.pathname}${url.search}` +
        `#Intent;scheme=${scheme};package=com.android.chrome;` +
        `S.browser_fallback_url=${encodeURIComponent(url.href)};end`;
    };

    // Phase de capture : passe avant les gestionnaires des composants.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
