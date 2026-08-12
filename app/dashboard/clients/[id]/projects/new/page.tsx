// app/dashboard/clients/[id]/projects/new/page.tsx
"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
export default function NewProjectPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Session expirée, reconnectez-vous.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("projects").insert({
      owner_id: user.id,
      client_id: params.id,
      name,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push(`/dashboard/clients/${params.id}`);
    router.refresh();
  }
  return (
    <div className="mx-auto max-w-lg px-4 sm:px-0">
      <h1 className="font-display text-2xl font-bold text-ink dark:text-white">
        Nouveau projet
      </h1>
      <p className="mt-2 text-sm text-[#6B7280] dark:text-white/50">
        Regroupez les devis liés à ce projet pour ce client.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white/80">
            Nom du projet
          </label>
          <input
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Rénovation boutique, Site web..."
            className="w-full rounded-lg border border-paperline bg-white px-4 py-2.5 text-sm focus:border-ledger-deep focus:outline-none dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white"
          />
        </div>
        {error && <p className="text-sm text-stamp">{error}</p>}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-ledger-deep px-5 py-2.5 text-sm font-semibold text-paper hover:bg-stamp disabled:opacity-60 sm:w-auto"
          >
            {loading ? "Enregistrement..." : "Créer le projet"}
          </button>
        </div>
      </form>
    </div>
  );
}
