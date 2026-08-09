// app/dashboard/page.tsx
import Link from "next/link";
import {
  FileText,
  UserPlus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Folder,
  FolderPlus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server"; // adapte le chemin si besoin

// Formatte un montant en Francs CFA
function formatCFA(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " CFA";
}

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const firstName = user?.user_metadata?.first_name ?? "";

  // Solde disponible = somme des factures payées.
  // Ajuste ci-dessous si besoin :
  // - nom de la table ("invoices")
  // - nom de la colonne montant ("amount")
  // - valeur exacte du statut payé ("payee" — peut-être "paid" chez toi)
  const { data: paidInvoices } = await supabase
    .from("invoices")
    .select("amount")
    .eq("status", "payee");

  const soldeDisponible =
    paidInvoices?.reduce((sum, inv) => sum + (inv.amount ?? 0), 0) ?? 0;

  // Factures impayées / Devis en attente / Clients actifs — ajuste les noms de
  // table/colonne/statut si besoin (mêmes hypothèses que pour le solde).
  const { count: facturesImpayeesCount } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("status", "impayee");

  const { count: devisEnAttenteCount } = await supabase
    .from("quotes")
    .select("*", { count: "exact", head: true })
    .eq("status", "attente");

  const { count: clientsActifsCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true });

  const stats = {
    soldeDisponible,
    facturesImpayees: facturesImpayeesCount ?? 0,
    devisEnAttente: devisEnAttenteCount ?? 0,
    clientsActifs: clientsActifsCount ?? 0,
    // TODO: le taux de paiement reste un mock — pas encore de logique définie
    tauxPaiement: "87%",
  };

  // Clients récents — ajuste "name" si ta colonne s'appelle autrement (ex: "nom")
  const { data: clientsRecentsData } = await supabase
    .from("clients")
    .select("id, name")
    .order("created_at", { ascending: false })
    .limit(3);

  const clientsRecents =
    clientsRecentsData?.map((c) => ({ id: c.id, nom: c.name })) ?? [];

  // Projets récents — jointure avec clients pour récupérer le nom du client.
  // Ajuste "name"/"status" si tes colonnes s'appellent autrement.
  const { data: projetsRecentsData } = await supabase
    .from("projects")
    .select("id, name, status, created_at, clients(name)")
    .order("created_at", { ascending: false })
    .limit(6);

  const projetsRecents =
    projetsRecentsData?.map((p) => ({
      date: new Date(p.created_at).toLocaleDateString("fr-FR"),
      projet: p.name,
      statut: p.status,
      client: (p as any).clients?.name ?? "—",
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

        {/* Carte solde façon carte bancaire (élément signature) + stats */}
        <div className="grid grid-cols-1 gap-4">
          <div className="relative overflow-hidden rounded-3xl p-6 text-white bg-gradient-to-br from-[#7D2AE7] via-[#7D2AE7] to-[#00C4CC] shadow-lg shadow-[#7D2AE7]/20">
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -right-2 bottom-4 w-24 h-24 rounded-full bg-white/10" />
            <p className="text-xs uppercase tracking-wide text-white/70 relative">
              Solde disponible
            </p>
            <p className="font-display text-3xl font-bold mt-2 relative">
              {formatCFA(stats.soldeDisponible)}
            </p>
            <div className="flex items-center justify-between mt-8 relative">
              <span className="font-display text-sm tracking-widest">
                OliPay
              </span>
              <span className="text-xs text-white/70">Carte compte pro</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="Factures impayées"
              value={stats.facturesImpayees}
              accent="#FE6F61"
              icon={<Clock size={18} />}
            />
            <StatCard
              label="Devis en attente"
              value={stats.devisEnAttente}
              accent="#2A89DA"
              icon={<FileText size={18} />}
            />
            <StatCard
              label="Clients actifs"
              value={stats.clientsActifs}
              accent="#00C4CC"
              icon={<UserPlus size={18} />}
            />
            <StatCard
              label="Taux de paiement"
              value={stats.tauxPaiement}
              accent="#7D2AE7"
              icon={<CheckCircle2 size={18} />}
            />
          </div>
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
                href="/dashboard/clients"
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

        {/* Carte solde (compacte) + stats — tout sur la même ligne */}
        <div className="grid grid-cols-5 gap-4">
          <div className="relative overflow-hidden rounded-2xl p-4 text-white bg-gradient-to-br from-[#7D2AE7] via-[#7D2AE7] to-[#00C4CC] shadow-lg shadow-[#7D2AE7]/20">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
            <p className="text-xs uppercase tracking-wide text-white/70 relative">
              Solde disponible
            </p>
            <p className="font-display text-xl font-bold mt-1 relative truncate">
              {formatCFA(stats.soldeDisponible)}
            </p>
          </div>

          <StatCard
            label="Factures impayées"
            value={stats.facturesImpayees}
            accent="#FE6F61"
            icon={<Clock size={18} />}
          />
          <StatCard
            label="Devis en attente"
            value={stats.devisEnAttente}
            accent="#2A89DA"
            icon={<FileText size={18} />}
          />
          <StatCard
            label="Clients actifs"
            value={stats.clientsActifs}
            accent="#00C4CC"
            icon={<UserPlus size={18} />}
          />
          <StatCard
            label="Taux de paiement"
            value={stats.tauxPaiement}
            accent="#7D2AE7"
            icon={<CheckCircle2 size={18} />}
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
                href="/dashboard/clients"
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
