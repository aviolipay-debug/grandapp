// app/dashboard/page.tsx
import Link from "next/link";
import {
  FileText,
  Users,
  FolderKanban,
  ArrowUpRight,
  Clock,
  Folder,
  FolderPlus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server"; // adapte le chemin si besoin

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const firstName = user?.user_metadata?.first_name ?? "";

  // Devis générés / Clients / Projets en cours / Projets en attente —
  // ajuste les noms de table/colonne/statut si besoin.
  const { count: clientsActifsCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true });

  const { count: devisGeneresCount } = await supabase
    .from("quotes")
    .select("*", { count: "exact", head: true });

  const { count: projetsEnCoursCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("status", "en_cours");

  const { count: projetsEnAttenteCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("status", "attente");

  const stats = {
    clientsActifs: clientsActifsCount ?? 0,
    devisGeneres: devisGeneresCount ?? 0,
    projetsEnCours: projetsEnCoursCount ?? 0,
    projetsEnAttente: projetsEnAttenteCount ?? 0,
  };

  // Clients récents — ajuste "name" si ta colonne s'appelle autrement (ex: "nom")
  const { data: clientsRecentsData } = await supabase
    .from("clients")
    .select("id, name")
    .order("created_at", { ascending: false })
    .limit(3);

  const clientsRecents =
    clientsRecentsData?.map((c) => ({ id: c.id, nom: c.name })) ?? [];

  // Projets récents — jointure avec clients pour récupérer le nom et l'id du client.
  const { data: projetsRecentsData } = await supabase
    .from("projects")
    .select("id, name, status, created_at, clients(id, name)")
    .order("created_at", { ascending: false })
    .limit(6);

  const projetsRecents =
    projetsRecentsData?.map((p) => ({
      id: p.id,
      date: new Date(p.created_at).toLocaleDateString("fr-FR"),
      projet: p.name,
      statut: p.status,
      client: (p as any).clients?.name ?? "—",
      clientId: (p as any).clients?.id ?? null,
    })) ?? [];

  return (
    <>
      {/* ---------- MOBILE (inchangé) ---------- */}
      <div className="lg:hidden flex flex-col gap-8 max-w-6xl">
        {/* En-tête */}
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition-colors w-fit"
          >
            Configurer mon compte
          </Link>
        </div>

        {/* Stats — synchronisées avec la version desktop */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Devis générés"
            value={stats.devisGeneres}
            accent="#7D2AE7"
            icon={<FileText size={18} />}
          />
          <StatCard
            label="Projets en attente"
            value={stats.projetsEnAttente}
            accent="#2A89DA"
            icon={<Clock size={18} />}
          />
          <StatCard
            label="Clients"
            value={stats.clientsActifs}
            accent="#00C4CC"
            icon={<Users size={18} />}
          />
          <StatCard
            label="Projets en cours"
            value={stats.projetsEnCours}
            accent="#FE6F61"
            icon={<FolderKanban size={18} />}
          />
        </div>

        {/* Clients récents */}
        <div>
          <h2 className="font-display font-semibold text-sm uppercase tracking-wide text-[#1C1C1C]/50 dark:text-white/50 mb-3">
            Clients récents
          </h2>
          <div className="flex flex-wrap gap-4">
            {clientsRecents.map((client) => (
              <Link
                key={client.id}
                href={`/dashboard/clients/${client.id}`}
                className="group flex flex-col items-center gap-2 w-24"
              >
                <div className="w-20 h-16 rounded-xl bg-white dark:bg-[#262626] border border-black/5 dark:border-white/10 flex items-center justify-center text-[#7D2AE7]">
                  <Folder size={26} strokeWidth={1.75} />
                </div>
                <span className="text-xs font-semibold text-center truncate w-full">
                  {client.nom}
                </span>
              </Link>
            ))}
            <Link
              href="/dashboard/clients/new"
              className="group flex flex-col items-center gap-2 w-24"
            >
              <div className="w-20 h-16 rounded-xl border-2 border-dashed border-black/10 dark:border-white/15 flex items-center justify-center text-[#1C1C1C]/40 dark:text-white/40">
                <FolderPlus size={24} strokeWidth={1.75} />
              </div>
              <span className="text-xs font-semibold text-center text-[#1C1C1C]/50 dark:text-white/50">
                Nouveau
              </span>
            </Link>
          </div>
        </div>

        {/* Projets récents */}
        <div>
          <h2 className="font-display font-semibold text-sm uppercase tracking-wide text-[#1C1C1C]/50 dark:text-white/50 mb-3">
            Projets récents
          </h2>

          <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#262626] overflow-hidden">
            {projetsRecents.map((p, i) => (
              <Link
                key={`${p.projet}-${i}`}
                href={p.clientId ? `/dashboard/clients/${p.clientId}/projects/${p.id}` : "/dashboard/clients"}
                className={`flex items-center justify-between gap-3 px-4 py-4 ${
                  i !== projetsRecents.length - 1
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
            ))}
          </div>
        </div>
      </div>

      {/* ---------- DESKTOP (réorganisé) ---------- */}
      <div className="hidden lg:flex lg:flex-col gap-8 max-w-6xl">
        {/* En-tête */}
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition-colors w-fit"
          >
            Configurer mon compte
          </Link>
        </div>

        {/* Stats — 4 cartes sur la même ligne */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Devis générés"
            value={stats.devisGeneres}
            accent="#7D2AE7"
            icon={<FileText size={18} />}
          />
          <StatCard
            label="Projets en attente"
            value={stats.projetsEnAttente}
            accent="#2A89DA"
            icon={<Clock size={18} />}
          />
          <StatCard
            label="Clients"
            value={stats.clientsActifs}
            accent="#00C4CC"
            icon={<Users size={18} />}
          />
          <StatCard
            label="Projets en cours"
            value={stats.projetsEnCours}
            accent="#FE6F61"
            icon={<FolderKanban size={18} />}
          />
        </div>

        {/* Clients récents — cartes façon dossier, inspirées de la référence */}
        <div>
          <h2 className="font-display font-semibold text-sm uppercase tracking-wide text-[#1C1C1C]/50 dark:text-white/50 mb-3">
            Clients récents
          </h2>
          <div className="flex flex-wrap gap-4">
            {clientsRecents.map((client) => (
              <Link
                key={client.id}
                href={`/dashboard/clients/${client.id}`}
                className="group flex flex-col items-center gap-2 w-28"
              >
                <div className="w-20 h-16 rounded-xl bg-white dark:bg-[#262626] border border-black/5 dark:border-white/10 flex items-center justify-center text-[#7D2AE7] group-hover:shadow-md group-hover:border-transparent transition-all">
                  <Folder size={26} strokeWidth={1.75} />
                </div>
                <span className="text-xs font-semibold text-center truncate w-full">
                  {client.nom}
                </span>
              </Link>
            ))}
            <Link
              href="/dashboard/clients/new"
              className="group flex flex-col items-center gap-2 w-28"
            >
              <div className="w-20 h-16 rounded-xl border-2 border-dashed border-black/10 dark:border-white/15 flex items-center justify-center text-[#1C1C1C]/40 dark:text-white/40 group-hover:text-[#7D2AE7] group-hover:border-[#7D2AE7] transition-colors">
                <FolderPlus size={24} strokeWidth={1.75} />
              </div>
              <span className="text-xs font-semibold text-center text-[#1C1C1C]/50 dark:text-white/50">
                Nouveau
              </span>
            </Link>
          </div>
        </div>

        {/* Projets récents — tableau, inspiré de la référence */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-sm uppercase tracking-wide text-[#1C1C1C]/50 dark:text-white/50">
              Projets récents
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/15 text-xs text-[#1C1C1C]/50 dark:text-white/50">
                <Search size={14} />
                <span>Rechercher</span>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/15 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <SlidersHorizontal size={14} />
                Filtres
              </button>
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
            {projetsRecents.map((p, i) => (
              <Link
                key={`${p.projet}-${i}`}
                href={p.clientId ? `/dashboard/clients/${p.clientId}/projects/${p.id}` : "/dashboard/clients"}
                className={`grid grid-cols-[120px_1fr_140px_1fr_40px] gap-4 items-center px-5 py-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors ${
                  i !== projetsRecents.length - 1
                    ? "border-b border-black/5 dark:border-white/10"
                    : ""
                }`}
              >
                <span className="text-sm text-[#1C1C1C]/60 dark:text-white/60">
                  {p.date}
                </span>
                <span className="text-sm font-medium truncate">
                  {p.projet}
                </span>
                <span>
                  <ProjectStatusBadge statut={p.statut} />
                </span>
                <span className="text-sm text-[#1C1C1C]/70 dark:text-white/70 truncate">
                  {p.client}
                </span>
                <ArrowUpRight
                  size={16}
                  className="text-[#1C1C1C]/30 dark:text-white/30"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string | number;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-4 bg-white dark:bg-[#262626] border border-black/5 dark:border-white/10">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-white mb-3"
        style={{ backgroundColor: accent }}
      >
        {icon}
      </div>
      <p className="font-display text-xl font-bold">{value}</p>
      <p className="text-xs text-[#1C1C1C]/50 dark:text-white/50 mt-0.5">
        {label}
      </p>
    </div>
  );
}

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
