// app/dashboard/projets-recents.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, SlidersHorizontal, X } from "lucide-react";

type Projet = {
  id: string;
  date: string;
  projet: string;
  statut: string;
  client: string;
  clientId: string | null;
};

const statusOptions: { value: string; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "attente", label: "En attente" },
  { value: "en_cours", label: "En cours" },
  { value: "termine", label: "Terminé" },
];

function ProjectStatusBadge({ statut }: { statut: string }) {
  const config: Record<string, { label: string; bg: string; text: string }> = {
    termine: { label: "Terminé", bg: "#00C4CC1A", text: "#00A6AC" },
    en_cours: { label: "En cours", bg: "#7D2AE71A", text: "#7D2AE7" },
    attente: { label: "En attente", bg: "#2A89DA1A", text: "#2A89DA" },
  };
  const c = config[statut] ?? config.attente;
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full w-fit inline-block"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {c.label}
    </span>
  );
}

export default function ProjetsRecentsSection({ projects }: { projects: Projet[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        !search ||
        p.projet.toLowerCase().includes(search.toLowerCase()) ||
        p.client.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.statut === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  function projectHref(p: Projet) {
    return p.clientId ? `/dashboard/clients/${p.clientId}/projects/${p.id}` : "/dashboard/clients";
  }

  return (
    <>
      {/* ---------- MOBILE ---------- */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-sm uppercase tracking-wide text-[#1C1C1C]/50 dark:text-white/50">
            Projets récents
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen((v) => !v);
                setMobileFiltersOpen(false);
              }}
              aria-label="Rechercher"
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                mobileSearchOpen
                  ? "bg-[#7D2AE7] text-white"
                  : "text-[#1C1C1C]/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              <Search size={16} />
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileFiltersOpen((v) => !v);
                setMobileSearchOpen(false);
              }}
              aria-label="Filtres"
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                mobileFiltersOpen
                  ? "bg-[#7D2AE7] text-white"
                  : "text-[#1C1C1C]/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>

        {mobileSearchOpen && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/15 px-3 py-2">
            <Search size={14} className="text-[#1C1C1C]/40 dark:text-white/40 shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un projet ou client..."
              className="w-full bg-transparent text-sm outline-none"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} aria-label="Effacer">
                <X size={14} className="text-[#1C1C1C]/40 dark:text-white/40" />
              </button>
            )}
          </div>
        )}

        {mobileFiltersOpen && (
          <div className="mb-3 flex flex-wrap gap-2">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatusFilter(opt.value)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                  statusFilter === opt.value
                    ? "border-[#7D2AE7] bg-[#7D2AE7] text-white"
                    : "border-black/10 dark:border-white/15 text-[#1C1C1C]/60 dark:text-white/60"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#262626] overflow-hidden">
          {filtered.length === 0 ? (
            <p className="p-6 text-center text-sm text-[#1C1C1C]/50 dark:text-white/50">
              Aucun projet ne correspond.
            </p>
          ) : (
            filtered.map((p, i) => (
              <Link
                key={p.id}
                href={projectHref(p)}
                className={`flex items-center justify-between gap-3 px-4 py-4 ${
                  i !== filtered.length - 1
                    ? "border-b border-black/5 dark:border-white/10"
                    : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{p.projet}</p>
                  <p className="text-xs text-[#1C1C1C]/50 dark:text-white/50 truncate">
                    {p.client} · {p.date}
                  </p>
                </div>
                <div className="shrink-0">
                  <ProjectStatusBadge statut={p.statut} />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* ---------- DESKTOP ---------- */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-sm uppercase tracking-wide text-[#1C1C1C]/50 dark:text-white/50">
            Projets récents
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/15 text-xs text-[#1C1C1C]/50 dark:text-white/50">
              <Search size={14} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher"
                className="bg-transparent outline-none w-32"
              />
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDesktopFiltersOpen((v) => !v)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                  desktopFiltersOpen || statusFilter !== "all"
                    ? "border-[#7D2AE7] text-[#7D2AE7]"
                    : "border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                <SlidersHorizontal size={14} />
                Filtres
              </button>
              {desktopFiltersOpen && (
                <div className="absolute right-0 top-full mt-2 z-20 min-w-[160px] rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#262626] shadow-lg overflow-hidden">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setStatusFilter(opt.value);
                        setDesktopFiltersOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2.5 text-sm font-medium ${
                        statusFilter === opt.value
                          ? "text-[#7D2AE7] bg-[#7D2AE7]/5"
                          : "text-[#1C1C1C] dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#262626] overflow-hidden">
          <div className="grid grid-cols-[120px_1fr_140px_1fr_40px] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#1C1C1C]/40 dark:text-white/40 border-b border-black/5 dark:border-white/10">
            <span>Date</span>
            <span>Projet</span>
            <span>Statut</span>
            <span>Client</span>
            <span />
          </div>
          {filtered.length === 0 ? (
            <p className="p-10 text-center text-sm text-[#1C1C1C]/50 dark:text-white/50">
              Aucun projet ne correspond.
            </p>
          ) : (
            filtered.map((p, i) => (
              <Link
                key={p.id}
                href={projectHref(p)}
                className={`grid grid-cols-[120px_1fr_140px_1fr_40px] gap-4 items-center px-5 py-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors ${
                  i !== filtered.length - 1
                    ? "border-b border-black/5 dark:border-white/10"
                    : ""
                }`}
              >
                <span className="text-sm text-[#1C1C1C]/60 dark:text-white/60">{p.date}</span>
                <span className="text-sm font-medium truncate">{p.projet}</span>
                <span>
                  <ProjectStatusBadge statut={p.statut} />
                </span>
                <span className="text-sm text-[#1C1C1C]/70 dark:text-white/70 truncate">
                  {p.client}
                </span>
                <ArrowUpRight size={16} className="text-[#1C1C1C]/30 dark:text-white/30" />
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  );
}
