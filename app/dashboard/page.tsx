// app/dashboard/page.tsx
import Link from "next/link";
import { FileText, Users, FolderKanban, Clock, FolderPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server"; // adapte le chemin si besoin
import { poppins } from "@/lib/fonts";
import ProjetsRecentsSection from "./projets-recents";
import DashboardExitGuard from "./dashboard-exit-guard";

export default async function DashboardPage() {
  const supabase = createClient();

  // Étape 1 : on ne fait attendre que ce qui est réellement indépendant de
  // l'utilisateur. Les 4 compteurs et les 2 listes n'ont pas besoin de
  // connaître user.id — RLS filtre déjà automatiquement sur l'utilisateur
  // connecté — donc ils partent EN MÊME TEMPS que la récupération de
  // l'utilisateur, au lieu d'attendre bêtement leur tour. On passe ainsi de
  // 8 allers-retours Supabase en série à seulement 2 étapes.
  const [
    {
      data: { user },
    },
    { count: clientsActifsCount },
    { count: devisGeneresCount },
    { count: projetsEnCoursCount },
    { count: projetsEnAttenteCount },
    { data: clientsRecentsData },
    { data: projetsRecentsData },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("quotes").select("*", { count: "exact", head: true }),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "en_cours"),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "attente"),
    supabase
      .from("clients")
      .select("id, name")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("projects")
      .select("id, name, status, created_at, clients(id, name), quotes(status, created_at)")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  // Prénom pour le message de bienvenue : "first_name" si présent, sinon le
  // premier mot du nom complet saisi à l'inscription (full_name).
  const meta = (user?.user_metadata ?? {}) as { first_name?: string; full_name?: string };
  const firstName = (meta.first_name ?? meta.full_name?.trim().split(/\s+/)[0] ?? "").trim();

  // Étape 2 : celle-ci dépend bien de user.id, donc elle ne peut pas être
  // parallélisée avec l'étape 1 — mais c'est la seule qui attend désormais.
  const { data: profile } = user
    ? await supabase.from("profiles").select("company_name").eq("id", user.id).single()
    : { data: null };
  const isConfigured = !!profile?.company_name;

  const stats = {
    clientsActifs: clientsActifsCount ?? 0,
    devisGeneres: devisGeneresCount ?? 0,
    projetsEnCours: projetsEnCoursCount ?? 0,
    projetsEnAttente: projetsEnAttenteCount ?? 0,
  };

  const clientsRecents =
    clientsRecentsData?.map((c) => ({ id: c.id, nom: c.name })) ?? [];

  const projetsRecents =
    projetsRecentsData?.map((p) => {
      // Si le devis le plus récent du projet a été refusé, on l'affiche tel
      // quel ("Refusé", en rouge) plutôt que le statut brut du projet
      // (attente/en_cours/termine), qui ne connaît pas cette notion — c'est
      // une valeur d'affichage calculée, jamais stockée en base.
      const quotesForProject = ((p as any).quotes ?? []) as {
        status: string;
        created_at: string;
      }[];
      const latestQuote =
        quotesForProject.length > 0
          ? [...quotesForProject].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0]
          : null;
      const statutAffiche = latestQuote?.status === "declined" ? "refuse" : p.status;

      return {
        id: p.id,
        date: new Date(p.created_at).toLocaleDateString("fr-FR"),
        projet: p.name,
        statut: statutAffiche,
        client: (p as any).clients?.name ?? "—",
        clientId: (p as any).clients?.id ?? null,
      };
    }) ?? [];

  return (
    <div className={`flex max-w-6xl flex-col gap-6 sm:gap-7 ${poppins.className}`}>
      <DashboardExitGuard />

      {/* Bienvenue — et bouton de configuration tant que le compte n'est pas configuré */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink dark:text-white sm:text-[28px]">
            {firstName ? `Bonjour, ${firstName}` : "Bonjour"}
          </h1>
          <p className="mt-1 text-sm text-muted dark:text-white/50">
            Voici l&apos;activité de votre entreprise.
          </p>
        </div>
        {!isConfigured && (
          <Link
            href="/onboarding"
            className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-ledger-deep px-5 text-sm font-semibold text-white transition-colors hover:bg-ledger-dark"
          >
            Configurer mon compte
          </Link>
        )}
      </header>

      {/* Stats — 2 colonnes sur mobile, 4 sur grand écran */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
          iconBg="#FFF1DD"
          iconColor="#9A5200"
          icon={<Clock size={18} />}
        />
        <StatCard
          label="CLIENTS"
          value={stats.clientsActifs}
          subtitle="enregistrés"
          iconBg="#EFE5FC"
          iconColor="#7D2AE7"
          icon={<Users size={18} />}
        />
        <StatCard
          label="PROJETS"
          value={stats.projetsEnCours}
          subtitle="en cours"
          iconBg="#E6F0FB"
          iconColor="#1D5799"
          icon={<FolderKanban size={18} />}
        />
      </div>

      {/* Clients récents — cartes façon dossier violet */}
      <section className="rounded-3xl border border-black/5 bg-white p-5 dark:border-white/10 dark:bg-[#262626] sm:p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-ink dark:text-white">
          Clients récents
        </h2>
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
          {clientsRecents.map((client) => (
            <Link
              key={client.id}
              href={`/dashboard/clients/${client.id}`}
              className="group flex flex-col gap-3 rounded-2xl bg-ledger-soft p-4 transition-shadow hover:shadow-md dark:bg-white/5"
            >
              <FolderIcon />
              <span className="truncate text-sm font-semibold text-ink dark:text-white">
                {client.nom}
              </span>
            </Link>
          ))}
          <Link
            href="/dashboard/clients/new"
            className="group flex flex-col items-start justify-between gap-3 rounded-2xl border-2 border-dashed border-ledger-deep/30 p-4 text-ledger-deep transition-colors hover:border-ledger-deep hover:bg-ledger-soft dark:border-white/15 dark:text-ledger-light dark:hover:bg-white/5"
          >
            <FolderPlus size={30} strokeWidth={1.75} />
            <span className="text-sm font-semibold">Nouveau client</span>
          </Link>
        </div>
      </section>

      {/* Projets récents géré par le composant partagé */}
      <ProjetsRecentsSection projects={projetsRecents} />
    </div>
  );
}

// Dossier à deux teintes : violet de marque + reflet cyan décoratif.
function FolderIcon() {
  return (
    <svg width="44" height="36" viewBox="0 0 44 36" fill="none" aria-hidden="true">
      <path
        d="M2 8a4 4 0 0 1 4-4h10l4 5h18a4 4 0 0 1 4 4v17a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z"
        fill="#00C4CC"
        fillOpacity="0.35"
      />
      <path
        d="M2 14a4 4 0 0 1 4-4h32a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z"
        fill="#7D2AE7"
      />
    </svg>
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
      className={`rounded-3xl px-5 py-3.5 ${
        dark
          ? "bg-[#181818] text-white"
          : "border border-black/5 bg-white text-ink dark:border-white/10 dark:bg-[#262626] dark:text-white"
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          {icon}
        </div>
      </div>
      <p className="font-display mt-1.5 text-2xl font-extrabold leading-tight">{value}</p>
      <p className={`text-sm ${dark ? "text-white/50" : "text-muted dark:text-white/50"}`}>{subtitle}</p>
    </div>
  );
}
