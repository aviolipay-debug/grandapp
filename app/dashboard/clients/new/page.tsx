"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ClientType = "entreprise" | "particulier";

export default function NewClientPage() {
  const router = useRouter();
  const supabase = createClient();
  const [clientType, setClientType] = useState<ClientType | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
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

    const { error } = await supabase.from("clients").insert({
      owner_id: user.id,
      type: clientType,
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/clients");
    router.refresh();
  }

  // Étape 1 : choix du type de client
  if (!clientType) {
    return (
      <div className="max-w-lg">
        <h1 className="font-display text-2xl font-bold text-ink dark:text-white">
          Nouveau client
        </h1>
        <p className="mt-2 text-sm text-[#6B7280] dark:text-white/50">
          C&apos;est un client professionnel ou particulier ?
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setClientType("entreprise")}
            className="flex flex-col items-center gap-3 rounded-2xl border border-paperline bg-white p-6 text-center transition-colors hover:border-ledger-deep dark:border-white/10 dark:bg-[#2F2F2F]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3EEFC] text-ledger-deep dark:bg-white/10">
              <Building2 size={22} />
            </div>
            <div>
              <div className="font-display font-semibold text-ink dark:text-white">
                Entreprise
              </div>
              <div className="text-xs text-[#6B7280] dark:text-white/50">
                Société, association, structure
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setClientType("particulier")}
            className="flex flex-col items-center gap-3 rounded-2xl border border-paperline bg-white p-6 text-center transition-colors hover:border-ledger-deep dark:border-white/10 dark:bg-[#2F2F2F]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3EEFC] text-ledger-deep dark:bg-white/10">
              <User size={22} />
            </div>
            <div>
              <div className="font-display font-semibold text-ink dark:text-white">
                Particulier
              </div>
              <div className="text-xs text-[#6B7280] dark:text-white/50">
                Personne individuelle
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Étape 2 : formulaire
  return (
    <div className="max-w-lg">
      <button
        type="button"
        onClick={() => setClientType(null)}
        className="mb-4 text-sm font-semibold text-ledger-deep"
      >
        ← Changer le type de client
      </button>

      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3EEFC] text-ledger-deep dark:bg-white/10">
          {clientType === "entreprise" ? <Building2 size={16} /> : <User size={16} />}
        </div>
        <h1 className="font-display text-2xl font-bold text-ink dark:text-white">
          Nouveau client {clientType === "entreprise" ? "— Entreprise" : "— Particulier"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white/80">
            {clientType === "entreprise" ? "Raison sociale" : "Nom complet"}
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded border border-paperline bg-white px-4 py-2.5 text-sm focus:border-ledger-deep focus:outline-none dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white/80">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded border border-paperline bg-white px-4 py-2.5 text-sm focus:border-ledger-deep focus:outline-none dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white/80">
            Téléphone
          </label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded border border-paperline bg-white px-4 py-2.5 text-sm focus:border-ledger-deep focus:outline-none dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink dark:text-white/80">
            Adresse
          </label>
          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full rounded border border-paperline bg-white px-4 py-2.5 text-sm focus:border-ledger-deep focus:outline-none dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white"
            rows={2}
          />
        </div>
        {error && <p className="text-sm text-stamp">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-ledger-deep px-5 py-2.5 text-sm font-semibold text-paper hover:bg-stamp disabled:opacity-60"
        >
          {loading ? "Enregistrement..." : "Enregistrer le client"}
        </button>
      </form>
    </div>
  );
}
