import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Violet = SEULE couleur de marque (boutons, liens d'action, onglet actif).
        // Les noms "ledger" sont conservés pour ne rien casser dans le code existant :
        // tout ce qui utilisait bg-ledger / text-ledger devient violet automatiquement.
        ledger: {
          DEFAULT: "#7D2AE7",
          deep: "#7D2AE7",
          dark: "#5B1BB5", // survol / état appuyé
          light: "#B98CFA", // texte violet sur fond sombre (dark mode)
          soft: "#EFE5FC", // fond violet très clair (pastilles, cartes actives)
        },
        // Cyan : décoratif uniquement (dégradés, illustrations, graphiques).
        // Jamais pour du texte ni des boutons (contraste insuffisant sur blanc).
        aqua: "#00C4CC",

        paper: "#F7F7FB",
        paperline: "#E5E7EB",
        ink: "#0E1318",
        muted: "#5B6070", // texte secondaire (contraste AA sur blanc)

        // Rouge unique pour refusé / erreur / suppression (remplace le corail).
        stamp: "#E5533F",

        // Bleu : liens et infos uniquement (version assombrie, lisible sur blanc).
        gold: "#2A6FB8",

        // Statuts : réservés au sens, jamais décoratifs.
        success: { DEFAULT: "#0F7B4B", soft: "#E3F6EC" }, // Payée
        warn: { DEFAULT: "#9A5200", soft: "#FFF1DD" }, // Partiellement payée
        danger: { DEFAULT: "#B3261E", soft: "#FDE8E6" }, // En retard / Refusé
        info: { DEFAULT: "#1D5799", soft: "#E6F0FB" }, // Envoyé
      },
      fontFamily: {
        display: ["Montserrat", "sans-serif"],
        body: ["Poppins", "sans-serif"],
        mono: ["Poppins", "sans-serif"],
        title: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
