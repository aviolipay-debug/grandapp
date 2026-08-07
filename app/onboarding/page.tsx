"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const steps = [
  { key: "structure", label: "Structure", desc: "Modèle d'organisation" },
  { key: "adresses", label: "Adresses", desc: "Correspondance" },
  { key: "documents", label: "Documents", desc: "Docs. administrative" },
  { key: "fichier", label: "Fichier joint", desc: "Ajout de fichier" },
  { key: "facture", label: "Facture", desc: "Choisissez un modèle" },
];

const sectors = [
  "Commerce & vente",
  "Services & conseil",
  "BTP & construction",
  "Restauration & hôtellerie",
  "Technologie",
  "Santé",
  "Éducation",
  "Transport & logistique",
  "Agriculture",
  "Autre",
];

const invoiceTemplates = [
  { id: "classic", name: "Classique", desc: "Sobre, structuré, idéal pour tous les secteurs." },
  { id: "modern", name: "Moderne", desc: "Plus coloré, avec les accents de votre marque." },
  { id: "minimal", name: "Minimaliste", desc: "Épuré, l'essentiel sans fioritures." },
];

type Contact = { indicatif: string; numero: string };

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Étape 1 — Structure
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");

  // Étape 2 — Adresses
  const [siegeSocial, setSiegeSocial] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([{ indicatif: "+229", numero: "" }]);

  // Étape 3 — Documents
  const [rccm, setRccm] = useState("");
  const [taxIds, setTaxIds] = useState<string[]>([""]);

  // Étape 4 — Fichiers
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

  // Étape 5 — Facture
  const [template, setTemplate] = useState("classic");

  const isLastStep = step === steps.length - 1;

  function updateContact(i: number, field: keyof Contact, value: string) {
    setContacts((prev) => prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));
  }

  function updateTaxId(i: number, value: string) {
    setTaxIds((prev) => prev.map((t, idx) => (idx === i ? value : t)));
  }

  function handleFileSelect(
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setPreview: (url: string | null) => void
  ) {
    const file = e.target.files?.[0] ?? null;
    setFile(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  function validateStep(): boolean {
    if (step === 0 && (!companyName.trim() || !sector)) {
      setError("Le nom de l'entreprise et le secteur d'activité sont obligatoires.");
      return false;
    }
    if (step === 1 && (!siegeSocial.trim() || !companyEmail.trim() || !contacts[0]?.numero.trim())) {
      setError("Le siège social, l'email et le contact principal sont obligatoires.");
      return false;
    }
    if (step === 3 && !logoFile) {
      setError("Le logo est obligatoire.");
      return false;
    }
    setError(null);
    return true;
  }

  function goNext() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function uploadFile(file: File, userId: string, kind: "logo" | "signature") {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${kind}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("company-files")
      .upload(path, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from("company-files").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleFinish() {
    if (!validateStep()) return;
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

    try {
      let logoUrl: string | null = null;
      let signatureUrl: string | null = null;

      if (logoFile) logoUrl = await uploadFile(logoFile, user.id, "logo");
      if (signatureFile) signatureUrl = await uploadFile(signatureFile, user.id, "signature");

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          company_name: companyName,
          business_sector: sector,
          company_address: siegeSocial,
          company_email: companyEmail,
          company_contacts: contacts.filter((c) => c.numero.trim()),
          rccm_number: rccm || null,
          tax_ids: taxIds.filter((t) => t.trim()),
          company_logo_url: logoUrl,
          signature_url: signatureUrl,
          invoice_template: template,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-paperline bg-white px-5 py-3.5 text-sm text-ink placeholder-[#9CA3AF] outline-none transition-colors focus:border-ledger dark:border-white/10 dark:bg-[#3a3a3a] dark:text-white dark:placeholder-white/40";
  const labelClass = "mb-2 block text-sm font-medium text-ink dark:text-white/80";
  const addBtnClass =
    "flex items-center gap-2 text-sm font-semibold text-ledger-deep dark:text-ledger";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F0F0F3] px-6 py-12 dark:bg-[#2F2F2F]">
      <div className="w-full max-w-md">
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

        {/* Étape 1 : Structure */}
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
                <label className={labelClass}>Secteur d&apos;activité *</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className={inputClass}
                >
                  <option value="">—</option>
                  {sectors.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Étape 2 : Adresses */}
        {step === 1 && (
          <div>
            <h2 className="font-display mb-1 text-xl font-bold text-ink dark:text-white">
              Où peut-on vous joindre ?
            </h2>
            <p className="mb-6 text-sm text-[#6B7280] dark:text-white/50">
              Ces informations apparaîtront sur vos devis et factures.
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelClass}>Siège social *</label>
                <input
                  value={siegeSocial}
                  onChange={(e) => setSiegeSocial(e.target.value)}
                  placeholder="Adresse de l'entreprise"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Adresse email *</label>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  placeholder="Adresse email"
                  className={inputClass}
                />
              </div>
              {contacts.map((c, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-24">
                    <label className={labelClass}>Indicatif {i === 0 && "*"}</label>
                    <input
                      value={c.indicatif}
                      onChange={(e) => updateContact(i, "indicatif", e.target.value)}
                      placeholder="+229"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex-1">
                    <label className={labelClass}>
                      {i === 0 ? "Contact primaire *" : "Contact"}
                    </label>
                    <input
                      value={c.numero}
                      onChange={(e) => updateContact(i, "numero", e.target.value)}
                      placeholder="Numéro"
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setContacts((prev) => [...prev, { indicatif: "+229", numero: "" }])}
                className={addBtnClass}
              >
                + Ajouter un contact
              </button>
            </div>
          </div>
        )}

        {/* Étape 3 : Documents */}
        {step === 2 && (
          <div>
            <h2 className="font-display mb-1 text-xl font-bold text-ink dark:text-white">
              Enregistrez vos informations fiscales
            </h2>
            <p className="mb-6 text-sm text-[#6B7280] dark:text-white/50">
              Évitez les retards en préparant vos documents administratifs à l&apos;avance.
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelClass}>N° Registre du commerce</label>
                <input
                  value={rccm}
                  onChange={(e) => setRccm(e.target.value)}
                  placeholder="Saisissez le n° RCCM"
                  className={inputClass}
                />
              </div>
              {taxIds.map((t, i) => (
                <div key={i}>
                  <label className={labelClass}>Numéro d&apos;identification</label>
                  <input
                    value={t}
                    onChange={(e) => updateTaxId(i, e.target.value)}
                    placeholder="N° d'identification"
                    className={inputClass}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setTaxIds((prev) => [...prev, ""])}
                className={addBtnClass}
              >
                + Ajouter un numéro d&apos;identification
              </button>
            </div>
          </div>
        )}

        {/* Étape 4 : Fichier joint */}
        {step === 3 && (
          <div>
            <h2 className="font-display mb-1 text-xl font-bold text-ink dark:text-white">
              Ajoutez les fichiers joints nécessaires
            </h2>
            <p className="mb-6 text-sm text-[#6B7280] dark:text-white/50">
              Assurez-vous que les fichiers sont dans un format compatible et de bonne qualité.
            </p>
            <div className="flex flex-col gap-4">
              <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-paperline bg-white p-4 dark:border-white/10 dark:bg-[#3a3a3a]">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-paperline text-ink dark:bg-white/10 dark:text-white">
                    ↑
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold text-ink dark:text-white">
                    Téléchargez le logo *
                  </div>
                  <div className="text-xs text-[#6B7280] dark:text-white/50">
                    Taille de fichier max. de 2 Mo
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, setLogoFile, setLogoPreview)}
                />
              </label>

              <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-paperline bg-white p-4 dark:border-white/10 dark:bg-[#3a3a3a]">
                {signaturePreview ? (
                  <img
                    src={signaturePreview}
                    alt="Signature"
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-paperline text-ink dark:bg-white/10 dark:text-white">
                    ↑
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold text-ink dark:text-white">
                    Téléchargez la Signature
                  </div>
                  <div className="text-xs text-[#6B7280] dark:text-white/50">
                    Taille de fichier max. de 2 Mo
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, setSignatureFile, setSignaturePreview)}
                />
              </label>
            </div>
          </div>
        )}

        {/* Étape 5 : Facture */}
        {step === 4 && (
          <div>
            <h2 className="font-display mb-1 text-xl font-bold text-ink dark:text-white">
              Personnalisez votre style de facturation
            </h2>
            <p className="mb-6 text-sm text-[#6B7280] dark:text-white/50">
              Sélectionnez un modèle qui reflète votre identité professionnelle.
            </p>
            <div className="flex flex-col gap-3">
              {invoiceTemplates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id)}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    template === t.id
                      ? "border-ledger-deep bg-ledger-deep/5 dark:bg-ledger-deep/20"
                      : "border-paperline bg-white dark:border-white/10 dark:bg-[#3a3a3a]"
                  }`}
                >
                  <div className="font-display font-semibold text-ink dark:text-white">
                    {t.name}
                  </div>
                  <div className="text-sm text-[#6B7280] dark:text-white/50">{t.desc}</div>
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
