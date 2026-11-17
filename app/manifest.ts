// app/manifest.ts
// Manifeste de l'application installable (PWA). "standalone" = l'application
// s'ouvre en plein écran, sans barre d'adresse ni nom de domaine.
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Devisfinance",
    short_name: "Devisfinance",
    description:
      "Créez des devis, transformez-les en factures, et suivez vos paiements.",
    lang: "fr",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F0F0F3",
    theme_color: "#7D2AE7",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
