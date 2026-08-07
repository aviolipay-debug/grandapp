"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const steps = [
  { key: "entreprise", label: "Structure", desc: "Modèle d'organisation" },
  { key: "client", label: "Client", desc: "Votre premier contact" },
  { key: "plan", label: "Formule", desc: "Choisissez votre plan" },
];

const plans = [
  { id: "free", name: "Gratuit", desc: "Pour démarrer, sans engagement." },
  { id: "pro", name: "Pro", desc: "Pour les équipes qui grandissent." },
  { id: "business", name: "Business", desc: "Pour les besoins avancés." },
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const [plan, setPlan] = useState("free");

  const isLastStep = step === steps.length - 1;

  function goNext() {
    if (step === 0 && !companyName.trim()) {
      setError("Le nom de l'entreprise est obligatoire.");
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleFinish() {
    setError(null);
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Session expirée, reconnectez-vous.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        company_name: companyName,
        company_address: companyAddress || null,
        plan,
      })
      .eq("id", user.id);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    if (clientName.trim()) {
      await supabase.from("clients").insert({
        owner_id: user.id,
        name: clientName,
        email: clientEmail || null,
        phone: clientPhone || null,
      });
    }

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  }

  const inputClass =
    "w-full rounded-xl border border-paperline bg-white px-5 py-3.5 text-sm text-ink placeholder-[#9CA3AF] outline-none transition-colors focus:border-ledger dark:border-white/10 dark:bg-[#3a3a3a] dark:text-white dark:placeholder-white/40";
  const labelClass = "mb-2 block text-sm font-medium text-ink dark:text-white/80";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F0F0F3] px-6 py-12 dark:bg-[#2F2F2F]">
      <div className="w-full max-w-md">
        {/* Barre de progression */}
        <div className="mb-8 flex gap-2">
          {steps.map((s, i) => (
            <div
              key={s.key}
              className={`h-1.5 flex-1 rounded-full ${
                i <= step ? "bg-ledger-deep" : "bg-paperline dark:bg-white/10"
              }`}
            />
          ))}
        </div>

        <h1 className="font-display text-center text-2xl font-bold text-ink dark:text-white">
          {steps[step].label}
        </h1>
        <p className="mb-6 text-center text-sm text-[#6B7280] dark:text-white/50">
          {steps[step].desc}
        </p>
        <div className="mb-6 h-px bg-paperline dark:bg-white/10" />

        {/* Étape 1 : Entreprise */}
        {step === 0 && (
          <div>
            <h2 className="font-display mb-1 text-xl font-bold text-ink dark:text-white">
              Personnalisez votre profil
            </h2>
            <p className="mb-6 text-sm text-[#6B7280] dark:text-white/50">
              Créez votre compte et définissez la structure de votre entreprise.
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelClass}>Nom de l&apos;entreprise *</label>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Nom de l'entreprise"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Adresse de l&apos;entreprise</label>
                <input
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="Optionnel"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {/* Étape 2 : Premier client */}
        {step === 1 && (
          <div>
            <h2 className="font-display mb-1 text-xl font-bold text-ink dark:text-white">
              Ajoutez un premier client
            </h2>
            <p className="mb-6 text-sm text-[#6B7280] dark:text-white/50">
              Facultatif — vous pourrez en ajouter d&apos;autres à tout moment.
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelClass}>Nom du client</label>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nom du client"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="Optionnel"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Téléphone</label>
                <input
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Optionnel"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {/* Étape 3 : Plan */}
        {step === 2 && (
          <div>
            <h2 className="font-display mb-1 text-xl font-bold text-ink dark:text-white">
              Choisissez votre formule
            </h2>
            <p className="mb-6 text-sm text-[#6B7280] dark:text-white/50">
              Vous pourrez changer à tout moment depuis vos paramètres.
            </p>
            <div className="flex flex-col gap-3">
              {plans.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlan(p.id)}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    plan === p.id
                      ? "border-ledger-deep bg-ledger-deep/5 dark:bg-ledger-deep/20"
                      : "border-paperline bg-white dark:border-white/10 dark:bg-[#3a3a3a]"
                  }`}
                >
                  <div className="font-display font-semibold text-ink dark:text-white">
                    {p.name}
                  </div>
                  <div className="text-sm text-[#6B7280] dark:text-white/50">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-xl bg-stamp/10 px-4 py-2.5 text-sm text-stamp">{error}</p>
        )}

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="flex-1 rounded-xl border border-paperline bg-white py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-[#F0F0F3] disabled:opacity-40 dark:border-white/10 dark:bg-[#3a3a3a] dark:text-white dark:hover:bg-[#454545]"
          >
            Retour
          </button>
          {isLastStep ? (
            <button
              type="button"
              onClick={handleFinish}
              disabled={loading}
              className="flex-1 rounded-xl bg-ledger-deep py-3.5 text-sm font-bold text-white transition-colors hover:bg-stamp disabled:opacity-60"
            >
              {loading ? "Finalisation…" : "Terminer"}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="flex-1 rounded-xl bg-ledger-deep py-3.5 text-sm font-bold text-white transition-colors hover:bg-stamp"
            >
              Suivant
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
