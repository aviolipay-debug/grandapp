// app/dashboard/page.tsx
import Link from "next/link";
import { FileText, Users, FolderKanban, Clock, Folder, FolderPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server"; // adapte le chemin si besoin
import { poppins } from "@/lib/fonts";
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
    <div className="relative isolate min-h-full">
      {/* Fond décoratif — taches de couleur floutées, discret, dans l'esprit OliPay */}
      <div className="pointer-events-none absolute -left-[6vw] -right-[6vw] -top-8 -bottom-24 -z-10 overflow-hidden md:-top-10 md:-bottom-10">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#7D2AE7]/25 blur-3xl dark:bg-[#7D2AE7]/15" />
        <div className="absolute -top-16 right-[-40px] h-80 w-80 rounded-full bg-[#00C4CC]/25 blur-3xl dark:bg-[#00C4CC]/15" />
        <div className="absolute top-72 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#2A89DA]/20 blur-3xl dark:bg-[#2A89DA]/10" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#FE6F61]/25 blur-3xl dark:bg-[#FE6F61]/15" />
      </div>

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
        <div className={`grid grid-cols-2 gap-4 ${poppins.className}`}>
          <StatCard
            label="DEVIS"
            value={stats.devisGeneres}
            subtitle="générés"
            dark
            iconBg="rgba(255,255,255,0.15)"
            iconColor="#FFFFFF"
            icon={<FileText size={18} />}
          />
          <StatCard
            label="PROJETS"
            value={stats.projetsEnAttente}
            subtitle="en attente"
            iconBg="#EAF3FC"
            iconColor="#2A89DA"
            icon={<Clock size={18} />}
          />
          <StatCard
            label="CLIENTS"
            value={stats.clientsActifs}
            subtitle="enregistrés"
            iconBg="#E7FAF9"
            iconColor="#00A6AC"
            icon={<Users size={18} />}
          />
          <StatCard
            label="PROJETS"
            value={stats.projetsEnCours}
            subtitle="en cours"
            iconBg="#FDEBEA"
            iconColor="#E5533F"
            icon={<FolderKanban size={18} />}
          />
        </div>

        {/* Clients récents */}
        <div className={poppins.className}>
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
        <div className={`grid grid-cols-4 gap-4 ${poppins.className}`}>
          <StatCard
            label="DEVIS"
            value={stats.devisGeneres}
            subtitle="générés"
            dark
            iconBg="rgba(255,255,255,0.15)"
            iconColor="#FFFFFF"
            icon={<FileText size={18} />}
          />
          <StatCard
            label="PROJETS"
            value={stats.projetsEnAttente}
            subtitle="en attente"
            iconBg="#EAF3FC"
            iconColor="#2A89DA"
            icon={<Clock size={18} />}
          />
          <StatCard
            label="CLIENTS"
            value={stats.clientsActifs}
            subtitle="enregistrés"
            iconBg="#E7FAF9"
            iconColor="#00A6AC"
            icon={<Users size={18} />}
          />
          <StatCard
            label="PROJETS"
            value={stats.projetsEnCours}
            subtitle="en cours"
            iconBg="#FDEBEA"
            iconColor="#E5533F"
            icon={<FolderKanban size={18} />}
          />
        </div>

        {/* Clients récents — cartes façon dossier, inspirées de la référence */}
        <div className={poppins.className}>
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
    </div>
  );
}

function StatCard({
  label,
  value,
  subtitle,
  iconBg,
  iconColor,
  icon,
  dark = false,
}: {
  label: string;
  value: string | number;
  subtitle: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl p-5 ${
        dark
          ? "bg-[#181818] text-white"
          : "border border-black/5 bg-white text-ink dark:border-white/10 dark:bg-[#262626] dark:text-white"
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          {icon}
        </div>
      </div>
      <p className="mt-4 text-3xl font-extrabold">{value}</p>
      <p className={`mt-1 text-sm ${dark ? "text-white/50" : "text-[#9CA3AF]"}`}>{subtitle}</p>
    </div>
  );
}
