// app/components/delete-button.tsx
"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Spinner from "./spinner";

// Icône poubelle + fenêtre de confirmation, pour supprimer un client ou un projet.
//  - client : la base supprime aussi ses projets, devis, factures et paiements
//    (suppression en cascade sur clients.id).
//  - projet : on supprime d'abord les factures tirées de ses devis, puis ses
//    devis, puis le projet (sinon les devis resteraient sans projet).
export default function DeleteButton({
  kind,
  id,
  name,
  className = "",
}: {
  kind: "client" | "project";
  id: string;
  name: string;
  className?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label = kind === "client" ? "ce client" : "ce projet";
  const consequences =
    kind === "client"
      ? "Tous ses projets, devis, factures et paiements seront aussi supprimés."
      : "Ses devis, factures et paiements seront aussi supprimés.";

  async function handleDelete() {
    setLoading(true);
    setError(null);

    try {
      if (kind === "client") {
        const { error: delError } = await supabase.from("clients").delete().eq("id", id);
        if (delError) throw delError;
      } else {
        const { data: quotes, error: quotesError } = await supabase
          .from("quotes")
          .select("id")
          .eq("project_id", id);
        if (quotesError) throw quotesError;
        const quoteIds = (quotes ?? []).map((q) => q.id);

        if (quoteIds.length > 0) {
          const { error: invError } = await supabase
            .from("invoices")
            .delete()
            .in("quote_id", quoteIds);
          if (invError) throw invError;

          const { error: quoteDelError } = await supabase
            .from("quotes")
            .delete()
            .in("id", quoteIds);
          if (quoteDelError) throw quoteDelError;
        }

        const { error: projError } = await supabase.from("projects").delete().eq("id", id);
        if (projError) throw projError;
      }

      setOpen(false);
      setLoading(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "La suppression a échoué.");
      setLoading(false);
    }
  }

  function close() {
    if (loading) return;
    setOpen(false);
    setError(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label={`Supprimer ${kind === "client" ? "le client" : "le projet"} ${name}`}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-stamp/10 hover:text-stamp ${className}`}
      >
        <Trash2 size={17} />
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 px-4"
            onClick={close}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-paperline bg-white p-6 dark:border-white/10 dark:bg-[#262626] sm:p-7"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-stamp/15 text-stamp">
                <AlertTriangle size={22} />
              </div>
              <h2 className="text-center font-display text-lg font-bold text-ink dark:text-white">
                Supprimer {label} ?
              </h2>
              <p className="mt-2 text-center text-sm text-[#6B7280] dark:text-white/50">
                <span className="font-semibold text-ink dark:text-white">{name}</span> sera{" "}
                <span className="font-semibold text-stamp">définitivement supprimé</span>.{" "}
                {consequences} Cette action est irréversible.
              </p>

              {error && (
                <p className="mt-3 rounded-xl bg-stamp/10 px-4 py-2.5 text-sm text-stamp">{error}</p>
              )}

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={close}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-paperline py-3 text-sm font-semibold text-ink hover:bg-[#F7F7FB] disabled:opacity-60 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-stamp py-3 text-sm font-bold text-white transition-colors hover:bg-stamp/90 disabled:opacity-60"
                >
                  {loading && <Spinner size={16} />}
                  {loading ? "Suppression…" : "Supprimer"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
