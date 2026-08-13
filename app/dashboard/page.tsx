// app/dashboard/page.tsx
import Link from "next/link";
import { FileText, Users, FolderKanban, Clock, Folder, FolderPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server"; // adapte le chemin si besoin
import ProjetsRecentsSection from "./projets-recents";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const firstName = user?.user_metadata?.first_name ?? "";

  // Le profil est considéré "configuré" dès que le nom d'entreprise est renseigné
  // (rempli à la fin de l'assistant d'onboarding) — sert à masquer le bouton.
  const { data: profile } = user
    ? await supabase.from("profiles").select("company_name").eq("id", user.id).single()
    : { data: null };
  const isConfigured = !!profile?.company_name;

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
        {/* En-tête — le bouton disparaît une fois le compte configuré */}
        {!isConfigured && (
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition-colors w-fit"
            >
              Configurer mon compte
            </Link>
          </div>
        )}

        {/* Stats — synchronisées avec la version desktop */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Devis générés"
            value={stats.devisGeneres}
            accent="#7D2AE7"
            gradient="linear-gradient(135deg, #9B4DFF, #6A1FD0)"
            icon={<FileText size={18} />}
          />
          <StatCard
            label="Projets en attente"
            value={stats.projetsEnAttente}
            accent="#2A89DA"
            gradient="linear-gradient(135deg, #4FA3F0, #1D5FB0)"
            icon={<Clock size={18} />}
          />
          <StatCard
            label="Clients"
            value={stats.clientsActifs}
            accent="#00C4CC"
            gradient="linear-gradient(135deg, #2EE0D9, #00959B)"
            icon={<Users size={18} />}
          />
          <StatCard
            label="Projets en cours"
            value={stats.projetsEnCours}
            accent="#FE6F61"
            gradient="linear-gradient(135deg, #FF9270, #E8483A)"
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
      </div>

      {/* ---------- DESKTOP (réorganisé) ---------- */}
      <div className="hidden lg:flex lg:flex-col gap-8 max-w-6xl">
        {/* En-tête — le bouton disparaît une fois le compte configuré */}
        {!isConfigured && (
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition-colors w-fit"
            >
              Configurer mon compte
            </Link>
          </div>
        )}

        {/* Stats — 4 cartes sur la même ligne */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Devis générés"
            value={stats.devisGeneres}
            accent="#7D2AE7"
            gradient="linear-gradient(135deg, #9B4DFF, #6A1FD0)"
            icon={<FileText size={18} />}
          />
          <StatCard
            label="Projets en attente"
            value={stats.projetsEnAttente}
            accent="#2A89DA"
            gradient="linear-gradient(135deg, #4FA3F0, #1D5FB0)"
            icon={<Clock size={18} />}
          />
          <StatCard
            label="Clients"
            value={stats.clientsActifs}
            accent="#00C4CC"
            gradient="linear-gradient(135deg, #2EE0D9, #00959B)"
            icon={<Users size={18} />}
          />
          <StatCard
            label="Projets en cours"
            value={stats.projetsEnCours}
            accent="#FE6F61"
            gradient="linear-gradient(135deg, #FF9270, #E8483A)"
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

        {/* Projets récents géré plus bas par le composant partagé */}
      </div>

      <div className="max-w-6xl mt-8">
        <ProjetsRecentsSection projects={projetsRecents} />
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  accent,
  gradient,
  icon,
}: {
  label: string;
  value: string | number;
  accent: string;
  gradient: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-4 text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)]"
      style={{ background: gradient }}
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/25 backdrop-blur-sm">
        {icon}
      </div>
      <p className="font-display text-xl font-bold">{value}</p>
      <p className="mt-0.5 text-xs text-white/80">{label}</p>
    </div>
  );
}
