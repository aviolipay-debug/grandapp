"use client";

import { useEffect } from "react";

/**
 * À placer UNIQUEMENT sur la page racine du dashboard (app/dashboard/page.tsx).
 * Ne bloque pas la navigation interne entre les pages du dashboard : le
 * retour classique du navigateur continue de fonctionner normalement
 * partout ailleurs (ex. depuis la fiche client vers le dashboard).
 *
 * Comportement une fois arrivé sur la page racine du dashboard :
 * le bouton retour ne fait plus rien (desktop ET mobile), pour ne jamais
 * exposer login/onboarding via l'historique du navigateur. Seul le bouton
 * "Se déconnecter" ferme la session.
 *
 * IMPORTANT : ce composant ne déconnecte JAMAIS l'utilisateur. Une version
 * précédente appelait supabase.auth.signOut() sur mobile après deux retours
 * rapprochés (< 2 s) — y compris quand ces "retours" venaient de la fenêtre
 * "Gestion" de la barre du bas (qui utilise aussi l'historique du
 * navigateur) — ce qui déconnectait l'utilisateur sans qu'il l'ait demandé.
 */
export default function DashboardExitGuard() {
  useEffect(() => {
    // Empile un état supplémentaire pour absorber le premier "retour".
    window.history.pushState({ dashboardExitGuard: true }, "", window.location.href);

    const handlePopState = () => {
      // Toujours bloqué : on remet un état dans l'historique à chaque retour.
      window.history.pushState({ dashboardExitGuard: true }, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return null;
}
