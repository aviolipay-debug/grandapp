// app/dashboard/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, User, Phone, Building2, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email ?? "");
      setFullName(user.user_metadata?.full_name ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("whatsapp_number")
        .eq("id", user.id)
        .single();

      setWhatsapp(profile?.whatsapp_number ?? "");
      setLoading(false);
    }
    loadProfile();
  }, [supabase, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    setSaved(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Session expirée, reconnectez-vous.");
      setSaving(false);
      return;
    }

    // Nom d'utilisateur -> user_metadata (auth.users), WhatsApp -> profiles.
    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ whatsapp_number: whatsapp || null })
      .eq("id", user.id);

    setSaving(false);

    if (authError || profileError) {
      setError(authError?.message ?? profileError?.message ?? "Une erreur est survenue.");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  const initial = (fullName || email || "?").trim().charAt(0).toUpperCase();

  const inputClass =
    "w-full rounded-xl border border-paperline bg-[#F7F7FB] px-4 py-3 pl-11 text-sm text-ink outline-none transition-colors focus:border-ledger dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white";
  const labelClass = "mb-1.5 block text-sm font-semibold text-ink dark:text-white";

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-[#6B7280] dark:text-white/50">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 py-4 lg:max-w-2xl">
      <h1 className="font-display text-xl font-bold text-ink dark:text-white">Mon profil</h1>

      {/* Carte d'identité */}
      <div className="flex items-center gap-4 rounded-2xl border border-paperline bg-white p-5 dark:border-white/10 dark:bg-[#262626]">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E9F23A] text-xl font-bold text-ink">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-bold text-ink dark:text-white">
            {fullName || "Utilisateur"}
          </p>
          <p className="truncate text-sm text-[#6B7280] dark:text-white/50">{email}</p>
        </div>
      </div>

      {/* Informations personnelles */}
      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-paperline bg-white p-5 dark:border-white/10 dark:bg-[#262626] sm:p-6"
      >
        <h2 className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#6B7280] dark:text-white/50">
          <User size={14} />
          Informations personnelles
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className={labelClass}>Adresse email</label>
              <span className="flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-[11px] font-medium text-[#6B7280] dark:bg-white/10 dark:text-white/50">
                <Lock size={10} />
                Non modifiable
              </span>
            </div>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                value={email}
                disabled
                className={`${inputClass} cursor-not-allowed opacity-70`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Nom d&apos;utilisateur</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Votre nom"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Numéro WhatsApp</label>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+229 ..."
                className={inputClass}
              />
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-stamp/10 px-4 py-2.5 text-sm text-stamp">{error}</p>
          )}
          {saved && !error && (
            <p className="rounded-xl bg-[#E7FAF9] px-4 py-2.5 text-sm font-semibold text-[#00A6AC] dark:bg-white/5">
              Modifications enregistrées.
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-1 rounded-xl bg-ledger-deep py-3.5 text-sm font-bold text-white transition-colors hover:bg-stamp disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : "Enregistrer les modifications"}
          </button>
        </div>
      </form>

      {/* Lien vers le profil entreprise (assistant existant) */}
      <Link
        href="/onboarding"
        className="flex items-center justify-between rounded-2xl border border-paperline bg-white p-5 transition-colors hover:bg-[#F7F7FB] dark:border-white/10 dark:bg-[#262626] dark:hover:bg-white/5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#2A89DA] dark:bg-white/10">
            <Building2 size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink dark:text-white">Profil de l&apos;entreprise</p>
            <p className="text-xs text-[#6B7280] dark:text-white/50">
              Nom, secteur, logo, modèle de facture…
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
