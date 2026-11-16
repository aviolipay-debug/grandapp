// app/components/theme-switch.tsx
// Bouton de thème de l'en-tête mobile : icône + nom du thème vers lequel on bascule
// ("Sombre" avec une lune en mode clair, "Clair" avec un soleil en mode sombre).
// Utilise la même clé de stockage que le script de app/layout.tsx.
"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeSwitch() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("devisfinance-theme", next ? "dark" : "light");
    } catch {
      // Stockage indisponible : le thème change quand même pour cette visite.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Passer au thème clair" : "Passer au thème sombre"}
      className="flex items-center gap-1.5 rounded-full px-2.5 py-2 text-xs font-semibold text-ink transition-colors hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
      {dark ? "Clair" : "Sombre"}
    </button>
  );
}
