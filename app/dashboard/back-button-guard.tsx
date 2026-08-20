"use client";

import { useEffect } from "react";

/**
 * Empêche le bouton "retour" du navigateur de quitter le dashboard.
 * À chaque tentative de retour, on repousse l'état courant : l'utilisateur
 * reste sur la page. La seule sortie vers la landing page ("/") reste la
 * déconnexion (voir header.tsx / sign-out-button.tsx).
 */
export default function BackButtonGuard() {
  useEffect(() => {
    // Empile un état supplémentaire pour absorber le premier "retour"
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      // Re-pousse immédiatement l'état courant : annule le retour
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return null;
}
