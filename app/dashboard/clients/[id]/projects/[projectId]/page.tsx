// app/dashboard/clients/[id]/projects/[projectId]/page.tsx
import Link from "next/link";
import { FileText, ChevronRight, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateProjectStatus } from "./actions";

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  accepted: "Accepté",
  declined: "Refusé",
  expired: "Expiré",
};

const statusStyles: Record<string, string> = {
  draft: "bg-[#F3F4F6] text-[#6B7280]",
  sent: "bg-[#EAF3FC] text-[#2A89DA]",
  accepted: "bg-[#E7FAF9] text-[#00A6AC]",
  declined: "bg-[#FDEBEA] text-[#E5533F]",
  expired: "bg-[#F3F4F6] text-[#6B7280]",
};

const projectStatusOptions: { value: "en_cours" | "attente" | "termine"; label: string }[] = [
  { value: "attente", label: "En attente" },
  { value: "en_cours", label: "En cours" },
  { value: "termine", label: "Terminé" },
];

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string; projectId: string };
}) {
  const supabase = createClient();

  const { data: projectData } = await supabase
    .from("projects")
    .select("id, name, status, clients(name)")
    .eq("id", params.projectId)
    .single();

  const project = projectData as any;

  const { data: quotes } = await supabase
    .from("quotes")
    .select("id, quote_number, status, total, currency, issue_date")
    .eq("project_id", params.projectId)
    .order("created_at", { ascending: false });

  const quoteId = quotes && quotes.length > 0 ? quotes[0].id : null;

  const { data: relatedInvoices } = quoteId
    ? await supabase
        .from("invoices")
        .select("id, invoice_number, document_type, status, total, currency, issue_date")
        .eq("quote_id", quoteId)
        .order("document_type", { ascending: true })
    : { data: null };

  const facture = relatedInvoices?.find((i) => i.document_type === "facture");
  const bordereau = relatedInvoices?.find((i) => i.document_type === "bordereau");

  if (!project) {
    return <p className="text-sm text-[#6B7280] dark:text-white/50">Projet introuvable.</p>;
  }

  return (
    <div>
      <Link
        href={`/dashboard/clients/${params.id}`}
        className="text-sm font-semibold text-ledger-deep"
      >
        ← {(project.clients as any)?.name ?? "Client"}
      </Link>

      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-ink dark:text-white">
          {project.name}
        </h1>
        {quotes && quotes.length > 0 ? (
          <Link
            href={`/dashboard/quotes/${quotes[0].id}/edit`}
            className="flex w-fit items-center gap-1.5 rounded-lg bg-ledger-deep px-3.5 py-2 text-sm font-semibold text-paper hover:bg-stamp"
          >
            Modifier le devis
          </Link>
        ) : (
          <Link
            href={`/dashboard/quotes/new?project_id=${project.id}&client_id=${params.id}`}
            className="flex w-fit items-center gap-1.5 rounded-lg bg-ledger-deep px-3.5 py-2 text-sm font-semibold text-paper hover:bg-stamp"
          >
            <Plus size={16} />
            Nouveau devis
          </Link>
        )}
      </div>

      {/* Statut du projet */}
      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[#6B7280] dark:text-white/40">
        Statut du projet
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {projectStatusOptions.map((opt) => (
          <form
            key={opt.value}
            action={updateProjectStatus.bind(null, project.id, params.id, opt.value)}
          >
            <button
              type="submit"
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold ${
                project.status === opt.value
                  ? "border-[#00A6AC] bg-[#00A6AC] text-white"
                  : "border-paperline bg-white text-[#4B5563] hover:border-[#00A6AC] dark:border-white/15 dark:bg-transparent dark:text-white/60"
              }`}
            >
              {opt.label}
            </button>
          </form>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-paperline bg-white dark:border-white/10 dark:bg-[#262626]">
        {!quotes || quotes.length === 0 ? (
          <p className="p-10 text-center text-sm text-[#6B7280] dark:text-white/50">
            Aucun devis rattaché à ce projet pour l&apos;instant.
          </p>
        ) : (
          <div className="divide-y divide-paperline dark:divide-white/10">
            {quotes.map((q) => (
              <Link
                key={q.id}
                href={`/dashboard/quotes/${q.id}`}
                className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-[#F7F7FB] active:bg-[#F0F0F5] dark:hover:bg-white/5 sm:px-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3EEFC] text-ledger-deep dark:bg-white/10">
                  <FileText size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-ink dark:text-white">
                      Devis · {q.quote_number}
                    </p>
                    <p className="shrink-0 font-mono text-sm font-semibold text-ink dark:text-white">
                      {Number(q.total).toLocaleString("fr-FR")} {q.currency}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="truncate text-sm text-[#6B7280] dark:text-white/50">
                      {q.issue_date}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        statusStyles[q.status] ?? "bg-[#F3F4F6] text-[#6B7280]"
                      }`}
                    >
                      {statusLabels[q.status] ?? q.status}
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="hidden shrink-0 text-[#9CA3AF] sm:block" />
              </Link>
            ))}

            {facture && (
              <Link
                href={`/dashboard/invoices/${facture.id}`}
                className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-[#F7F7FB] active:bg-[#F0F0F5] dark:hover:bg-white/5 sm:px-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E7FAF9] text-[#00A6AC] dark:bg-white/10">
                  <FileText size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-ink dark:text-white">
                      Facture · {facture.invoice_number}
                    </p>
                    <p className="shrink-0 font-mono text-sm font-semibold text-ink dark:text-white">
                      {Number(facture.total).toLocaleString("fr-FR")} {facture.currency}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-[#6B7280] dark:text-white/50">
                    {facture.issue_date}
                  </p>
                </div>
                <ChevronRight size={18} className="hidden shrink-0 text-[#9CA3AF] sm:block" />
              </Link>
            )}

            {bordereau && (
              <Link
                href={`/dashboard/invoices/${bordereau.id}`}
                className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-[#F7F7FB] active:bg-[#F0F0F5] dark:hover:bg-white/5 sm:px-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#2A89DA] dark:bg-white/10">
                  <FileText size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-ink dark:text-white">
                      Bordereau de livraison · {bordereau.invoice_number}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-[#6B7280] dark:text-white/50">
                    {bordereau.issue_date}
                  </p>
                </div>
                <ChevronRight size={18} className="hidden shrink-0 text-[#9CA3AF] sm:block" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
