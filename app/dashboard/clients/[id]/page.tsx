// app/dashboard/clients/[id]/page.tsx
import Link from "next/link";
import { Building2, User, Plus, FolderKanban, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", params.id)
    .single();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, created_at")
    .eq("client_id", params.id)
    .order("created_at", { ascending: false });

  if (!client) {
    return <p className="text-sm text-[#6B7280] dark:text-white/50">Client introuvable.</p>;
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3FC] text-[#2A89DA] dark:bg-white/10">
          {client.type === "entreprise" ? <Building2 size={22} /> : <User size={22} />}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink dark:text-white">
            {client.name}
          </h1>
          <p className="text-sm text-[#6B7280] dark:text-white/50">
            {client.email ?? "—"}
            {client.phone ? ` · ${client.phone}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display font-semibold text-sm uppercase tracking-wide text-[#6B7280] dark:text-white/50">
          Projets
        </h2>
        <Link
          href={`/dashboard/clients/${client.id}/projects/new`}
          className="flex items-center gap-1.5 rounded-lg bg-ledger-deep px-3.5 py-2 text-sm font-semibold text-paper hover:bg-stamp"
        >
          <Plus size={16} />
          Nouveau projet
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-paperline bg-white dark:border-white/10 dark:bg-[#262626]">
        {!projects || projects.length === 0 ? (
          <p className="p-10 text-center text-sm text-[#6B7280] dark:text-white/50">
            Aucun projet pour l&apos;instant. Créez-en un pour organiser les devis de ce client.
          </p>
        ) : (
          <div className="divide-y divide-paperline dark:divide-white/10">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/clients/${client.id}/projects/${p.id}`}
                className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-[#F7F7FB] active:bg-[#F0F0F5] dark:hover:bg-white/5 sm:px-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3EEFC] text-ledger-deep dark:bg-white/10">
                  <FolderKanban size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink dark:text-white">{p.name}</p>
                  <p className="mt-0.5 text-sm text-[#6B7280] dark:text-white/50">
                    Créé le {new Date(p.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <ChevronRight size={18} className="hidden shrink-0 text-[#9CA3AF] sm:block" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
