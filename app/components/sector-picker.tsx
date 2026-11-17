// app/components/sector-picker.tsx
// Choix du secteur d'activité : un champ qui ouvre une fenêtre avec recherche
// (feuille qui monte du bas sur mobile, carte centrée sur ordinateur).
"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

// Recherche sans tenir compte des accents ni des majuscules ("ecole" trouve "École").
const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function SectorPicker({
  value,
  onChange,
  options,
  triggerClassName,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  triggerClassName: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const list = useMemo(() => {
    const base = value && !options.includes(value) ? [value, ...options] : options;
    const q = normalize(query.trim());
    return q ? base.filter((o) => normalize(o).includes(q)) : base;
  }, [options, query, value]);

  function pick(option: string) {
    onChange(option);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={`${triggerClassName} flex items-center justify-between text-left`}
      >
        <span className={value ? "" : "text-[#9CA3AF] dark:text-white/40"}>
          {value || "Choisissez le secteur"}
        </span>
        <ChevronDown size={16} className="shrink-0 text-[#9CA3AF]" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/40 sm:items-center sm:px-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="sector-title"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[80dvh] w-full max-w-md flex-col rounded-t-3xl border border-paperline bg-white px-5 pb-4 pt-3 dark:border-white/10 dark:bg-[#262626] sm:rounded-2xl sm:px-6"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-paperline dark:bg-white/20 sm:hidden" />
            <h2
              id="sector-title"
              className="font-display text-lg font-bold text-ink dark:text-white"
            >
              Choisissez le secteur
            </h2>

            <div className="mt-4 flex items-center gap-2 rounded-xl border border-paperline px-3.5 py-2.5 focus-within:border-ledger dark:border-white/10">
              <Search size={18} className="shrink-0 text-[#9CA3AF]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher"
                autoFocus
                className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-[#9CA3AF] dark:text-white dark:placeholder:text-white/40"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Effacer la recherche"
                  className="shrink-0 text-[#9CA3AF] hover:text-ink dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <ul className="mt-2 flex-1 overflow-y-auto">
              {list.length === 0 && (
                <li className="px-1 py-6 text-center text-sm text-[#6B7280] dark:text-white/50">
                  Aucun secteur trouvé
                </li>
              )}
              {list.map((option) => (
                <li key={option}>
                  <button
                    type="button"
                    onClick={() => pick(option)}
                    className={`flex w-full items-center justify-between rounded-lg px-1 py-3 text-left text-[15px] transition-colors hover:bg-ledger-soft/60 dark:hover:bg-white/5 ${
                      option === value
                        ? "font-semibold text-ledger-deep dark:text-ledger-light"
                        : "text-ink dark:text-white/80"
                    }`}
                  >
                    {option}
                    {option === value && <Check size={16} />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
