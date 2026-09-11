"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Fenêtre de temps pendant laquelle un deuxième retour rapproché,
// sur mobile, est considéré comme une confirmation pour quitter.
const EXIT_WINDOW_MS = 2000;

/**
 * À placer UNIQUEMENT sur la page racine du dashboard (app/dashboard/page.tsx).
 * Ne bloque pas la navigation interne entre les pages du dashboard : le
 * retour classique du navigateur continue de fonctionner normalement
 * partout ailleurs (ex. depuis la fiche client vers le dashboard).
 *
 * Comportement une fois arrivé sur la page racine du dashboard :
 * - Desktop : le bouton retour ne fait plus rien. Seule la déconnexion
 *   ramène vers la page d'accueil publique.
 * - Mobile : premier retour = ne fait rien (arme un délai) ; un deuxième
 *   retour dans les 2 secondes déclenche automatiquement la déconnexion
 *   puis redirige vers "/" — jamais d'exposition de login/onboarding via
 *   l'historique du navigateur.
 */
export default function DashboardExitGuard() {
  const lastBackAttemptRef = useRef<number>(0);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const isMobile =
      typeof navigator !== "undefined" &&
      /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // Empile un état supplémentaire pour absorber le premier "retour".
    window.history.pushState({ dashboardExitGuard: true }, "", window.location.href);

    const handlePopState = async () => {
      if (isMobile) {
        const now = Date.now();
        const elapsed = now - lastBackAttemptRef.current;

        if (lastBackAttemptRef.current !== 0 && elapsed < EXIT_WINDOW_MS) {
          // Deuxième retour rapproché : on déconnecte proprement puis on
          // redirige vers l'accueil, au lieu de laisser l'historique réel
          // (login/onboarding) s'afficher.
          await supabase.auth.signOut();
          router.push("/");
          router.refresh();
          return;
        }

        lastBackAttemptRef.current = now;
      }

      // Desktop : toujours bloqué. Mobile, premier essai : bloqué aussi.
      window.history.pushState({ dashboardExitGuard: true }, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router, supabase]);

  return null;
}
