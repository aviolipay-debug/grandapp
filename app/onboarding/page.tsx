"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pdf } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/client";
import DashboardHeader from "../dashboard/header";
import BottomNav from "../dashboard/bottom-nav";
import LoadingOverlay from "../components/loading-overlay";
import { TEMPLATES, type TemplateId } from "@/lib/pdf/templates";
import type { DocumentData } from "@/lib/pdf/types";

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

type Contact = { indicatif: string; numero: string };

// Modèles disponibles — dérivés directement du dispatch PDF (lib/pdf/templates)
// : chaque nouveau modèle ajouté là-bas apparaît automatiquement ici, sans
// rien à dupliquer.
const invoiceTemplates = Object.keys(TEMPLATES) as TemplateId[];

const templateLabels: Record<string, string> = {
  "template-ako": "AKO — Jaune & Noir",
  "template-degrade": "La Facture — Dégradé coloré",
  "template-nuit": "Nuit — Sombre & Jaune",
};

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  // "loading" pendant qu'on vérifie si le profil existe déjà, "wizard" pour
  // l'assistant en plusieurs étapes (première configuration), "profile" pour
  // la fiche profil sur une seule page (modification directe).
  const [mode, setMode] = useState<"loading" | "wizard" | "profile">("loading");

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Étape 1 — Structure
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");

  // Étape 2 — Adresses
  const [siegeSocial, setSiegeSocial] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([{ indicatif: "+229", numero: "" }]);

  // Étape 3 — Documents
  const [rccm, setRccm] = useState("");
  const [taxIds, setTaxIds] = useState<string[]>([""]);

  // Étape 4 — Fichiers
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  // URLs déjà enregistrées en base — conservées si aucun nouveau fichier n'est choisi.
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
  const [existingSignatureUrl, setExistingSignatureUrl] = useState<string | null>(null);

  // Étape 5 — Facture (modèle choisi par le client)
  const [template, setTemplate] = useState<string>("template-ako");

  // Aperçus PDF réels (pas un dessin approximatif) — un par modèle, générés
  // avec les vraies infos déjà saisies (nom, adresse, contact, logo) plus
  // quelques lignes d'exemple pour remplir le tableau.
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [previewsLoading, setPreviewsLoading] = useState(false);

  const isLastStep = step === steps.length - 1;

  // Au chargement : si un profil déjà configuré existe, on bascule en mode
  // "fiche profil" pré-remplie plutôt que de relancer l'assistant.
  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMode("wizard");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile?.company_name) {
        setCompanyName(profile.company_name ?? "");
        setSector(profile.business_sector ?? "");
        setSiegeSocial(profile.company_address ?? "");
        setCompanyEmail(profile.company_email ?? "");
        setCompanyPhone(profile.company_phone ?? "");
        setContacts(
          Array.isArray(profile.company_contacts) && profile.company_contacts.length > 0
            ? profile.company_contacts
            : [{ indicatif: "+229", numero: "" }]
        );
        setRccm(profile.rccm_number ?? "");
        setTaxIds(
          Array.isArray(profile.tax_ids) && profile.tax_ids.length > 0 ? profile.tax_ids : [""]
        );
        setExistingLogoUrl(profile.company_logo_url ?? null);
        setExistingSignatureUrl(profile.signature_url ?? null);
        setLogoPreview(profile.company_logo_url ?? null);
        setSignaturePreview(profile.signature_url ?? null);
        setTemplate(profile.invoice_template ?? "template-ako");
        setMode("profile");
      } else {
        setMode("wizard");
      }
    }
    loadProfile();
  }, [supabase]);

  // Génère un vrai rendu PDF (via @react-pdf/renderer) pour chaque modèle
  // disponible, uniquement à l'étape 5 — avec le vrai nom d'entreprise, la
  // vraie adresse, le vrai contact et le vrai logo déjà sélectionnés.
  useEffect(() => {
    if (step !== 4) return;

    let cancelled = false;
    const generatedUrls: string[] = [];

    async function generatePreviews() {
      setPreviewsLoading(true);

      const previewData: DocumentData = {
        kind: "Facture",
        number: "0001",
        objet: "Exemple de prestation",
        issueDate: "01/01/2026",
        dueOrExpiryDate: null,
        companyName: companyName || "Votre entreprise",
        companyAddress: siegeSocial || null,
        companyLogoUrl: logoPreview,
        companyPhone: contacts[0]?.numero
          ? `${contacts[0].indicatif} ${contacts[0].numero}`
          : null,
        clientName: "Client Exemple",
        clientPhone: "+229 01 00 00 00 00",
        clientEmail: null,
        clientAddress: "Cotonou, Bénin",
        items: [
          { description: "Prestation 1", quantity: 1, unit_price: 50000, line_total: 50000 },
          { description: "Prestation 2", quantity: 2, unit_price: 25000, line_total: 50000 },
        ],
        subtotal: 100000,
        discountRate: 0,
        taxRate: 0,
        total: 100000,
        amountPaid: 0,
        currency: "FCFA",
        notes: null,
      };

      const entries = await Promise.all(
        invoiceTemplates.map(async (id) => {
          try {
            const Component = TEMPLATES[id];
            const blob = await pdf(<Component data={previewData} />).toBlob();
            const url = URL.createObjectURL(blob);
            generatedUrls.push(url);
            return [id, url] as const;
          } catch {
            return [id, null] as const;
          }
        })
      );

      if (cancelled) return;

      setPreviewUrls(
        Object.fromEntries(entries.filter(([, url]) => url !== null)) as Record<string, string>
      );
      setPreviewsLoading(false);
    }

    generatePreviews();

    return () => {
      cancelled = true;
      generatedUrls.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, companyName, siegeSocial, contacts, logoPreview]);

  function updateContact(i: number, field: keyof Contact, value: string) {
    // Pour le numéro, on formate à la volée avec un espace tous les 2 chiffres
    // (ex: "01 66 08 13 51"), tout en laissant l'indicatif tel quel.
    const finalValue =
      field === "numero" ? value.replace(/\D/g, "").replace(/(\d{2})(?=\d)/g, "$1 ") : value;
    setContacts((prev) => prev.map((c, idx) => (idx === i ? { ...c, [field]: finalValue } : c)));
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
    if (step === 3 && !logoFile && !logoPreview) {
      setError("Le logo est obligatoire.");
      return false;
    }
    setError(null);
    return true;
  }

  function goNext() {
    if (!validateStep()) return;
    setSaved(false);
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function goBack() {
    setError(null);
    setSaved(false);
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

  async function saveProfileData(afterSave: () => void) {
    setError(null);
    setLoading(true);
    setSaved(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Session expirée, reconnectez-vous.");
      setLoading(false);
      return;
    }

    try {
      // On conserve les fichiers déjà enregistrés tant qu'aucun nouveau n'est choisi.
      let logoUrl = existingLogoUrl;
      let signatureUrl = existingSignatureUrl;

      if (logoFile) logoUrl = await uploadFile(logoFile, user.id, "logo");
      if (signatureFile) signatureUrl = await uploadFile(signatureFile, user.id, "signature");

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          company_name: companyName,
          business_sector: sector,
          company_address: siegeSocial,
          company_email: companyEmail,
          company_phone: companyPhone || null,
          company_contacts: contacts.filter((c) => c.numero.trim()),
          rccm_number: rccm || null,
          tax_ids: taxIds.filter((t) => t.trim()),
          company_logo_url: logoUrl,
          signature_url: signatureUrl,
          invoice_template: template,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      afterSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setLoading(false);
    }
  }

  // Bouton final : "Terminer" -> dashboard (première configuration),
  // "Enregistrer" -> affiche la confirmation puis redirige aussi vers le dashboard.
  async function handlePrimaryAction() {
    if (!validateStep()) return;
    await saveProfileData(() => {
      if (mode === "wizard") {
        router.push("/dashboard");
        router.refresh();
      } else {
        setSaved(true);
        router.refresh();
        setTimeout(() => {
          router.push("/dashboard");
        }, 1200);
      }
    });
  }

  const inputClass =
    "w-full rounded-xl border border-paperline bg-white px-5 py-3.5 text-sm text-ink placeholder-[#9CA3AF] outline-none transition-colors focus:border-ledger dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white dark:placeholder-white/40";
  const labelClass = "mb-2 block text-sm font-medium text-ink dark:text-white/80";
  const addBtnClass =
    "flex items-center gap-2 text-sm font-semibold text-ledger-deep dark:text-ledger";

  if (mode === "loading") {
    return (
      <div className="flex min-h-screen flex-col bg-[#F7F8FB] font-sans text-ink dark:bg-[#2F2F2F] dark:text-white">
        <LoadingOverlay show message="Chargement…" />
        <DashboardHeader />
        <main className="flex flex-1 items-center justify-center px-6 py-12 pb-24 md:pb-12">
          <p className="text-sm text-[#6B7280] dark:text-white/50">Chargement...</p>
        </main>
        <BottomNav />
      </div>
    );
  }

  // ---------- MODE "ASSISTANT" (première configuration) ----------
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FB] font-sans text-ink dark:bg-[#2F2F2F] dark:text-white">
      <LoadingOverlay
        show={loading}
        message={mode === "wizard" ? "Finalisation…" : "Enregistrement…"}
      />
      <DashboardHeader />
      <main className="relative isolate flex flex-1 items-center justify-center overflow-hidden px-6 py-12 pb-24 md:pb-12">
        {/* Fond décoratif — taches de couleur floutées, cohérent avec le dashboard */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#7D2AE7]/25 blur-3xl dark:bg-[#7D2AE7]/15" />
          <div className="absolute -top-16 right-[-40px] h-80 w-80 rounded-full bg-[#00C4CC]/25 blur-3xl dark:bg-[#00C4CC]/15" />
          <div className="absolute top-72 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#2A89DA]/20 blur-3xl dark:bg-[#2A89DA]/10" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#FE6F61]/25 blur-3xl dark:bg-[#FE6F61]/15" />
        </div>

        <div className="w-full max-w-md rounded-2xl border border-paperline bg-white p-6 shadow-[0_10px_30px_-15px_rgba(14,19,24,0.25)] dark:border-white/10 dark:bg-[#3a3a3a] dark:shadow-none sm:p-8">
        <div className="mb-5 flex gap-2 sm:mb-8">
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
        <p className="mb-4 text-center text-sm text-[#6B7280] dark:text-white/50 sm:mb-6">
          {steps[step].desc}
        </p>
        <div className="mb-4 h-px bg-paperline dark:bg-white/10 sm:mb-6" />

        {/* Étape 1 : Structure */}
        {step === 0 && (
          <div>
            <h2 className="font-display mb-1 text-xl font-bold text-ink dark:text-white">
              Personnalisez votre profil
            </h2>
            <p className="mb-4 text-sm text-[#6B7280] dark:text-white/50 sm:mb-6">
              Créez votre compte et définissez la structure de votre entreprise.
            </p>
            <div className="flex flex-col gap-3 sm:gap-4">
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
            <p className="mb-4 text-sm text-[#6B7280] dark:text-white/50 sm:mb-6">
              Ces informations apparaîtront sur vos devis et factures.
            </p>
            <div className="flex flex-col gap-3 sm:gap-4">
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
            <p className="mb-4 text-sm text-[#6B7280] dark:text-white/50 sm:mb-6">
              Évitez les retards en préparant vos documents administratifs à l&apos;avance.
            </p>
            <div className="flex flex-col gap-3 sm:gap-4">
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
            <p className="mb-4 text-sm text-[#6B7280] dark:text-white/50 sm:mb-6">
              Assurez-vous que les fichiers sont dans un format compatible et de bonne qualité.
            </p>
            <div className="flex flex-col gap-3 sm:gap-4">
              <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-paperline bg-white p-4 dark:border-white/10 dark:bg-[#2F2F2F]">
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

              <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-paperline bg-white p-4 dark:border-white/10 dark:bg-[#2F2F2F]">
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

        {/* Étape 5 : Facture — vrai aperçu PDF (react-pdf), avec le vrai logo/nom déjà saisis */}
        {step === 4 && (
          <div>
            <h2 className="font-display mb-1 text-xl font-bold text-ink dark:text-white">
              Personnalisez votre style de facturation
            </h2>
            <p className="mb-4 text-sm text-[#6B7280] dark:text-white/50 sm:mb-6">
              Choisissez simplement celui qui vous plaît — l&apos;aperçu ci-dessous est le vrai
              PDF, avec votre logo.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {invoiceTemplates.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTemplate(id)}
                  className={`overflow-hidden rounded-xl border-2 text-left transition-colors ${
                    template === id
                      ? "border-ledger-deep"
                      : "border-paperline dark:border-white/10"
                  }`}
                >
                  <div className="h-40 w-full overflow-hidden bg-[#F3F4F6] dark:bg-[#1e1e1e]">
                    {previewUrls[id] ? (
                      <iframe
                        src={`${previewUrls[id]}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="pointer-events-none h-[420px] w-full origin-top-left"
                        style={{ transform: "scale(0.62)", width: "161%" }}
                        title={templateLabels[id] ?? id}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-[#6B7280] dark:text-white/50">
                        {previewsLoading ? "Génération de l'aperçu…" : "Aperçu indisponible"}
                      </div>
                    )}
                  </div>
                  <p className="px-2 py-1.5 text-center text-xs font-semibold text-ink dark:text-white">
                    {templateLabels[id] ?? id}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-xl bg-stamp/10 px-4 py-2.5 text-sm text-stamp">{error}</p>
        )}
        {saved && !error && (
          <p className="mt-4 rounded-xl bg-[#E7FAF9] px-4 py-2.5 text-sm font-semibold text-[#00A6AC] dark:bg-white/5">
            Modifications enregistrées.
          </p>
        )}

        <div className="mt-5 flex gap-3 sm:mt-8">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="flex-1 rounded-xl border border-paperline bg-white py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-[#F0F0F3] disabled:opacity-40 dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white dark:hover:bg-[#454545]"
          >
            Retour
          </button>
          {isLastStep ? (
            <button
              type="button"
              onClick={handlePrimaryAction}
              disabled={loading}
              className="flex-1 rounded-xl bg-ledger-deep py-3.5 text-sm font-bold text-white transition-colors hover:bg-stamp disabled:opacity-60"
            >
              {loading
                ? mode === "wizard"
                  ? "Finalisation…"
                  : "Enregistrement..."
                : mode === "wizard"
                ? "Terminer"
                : "Enregistrer"}
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
      <BottomNav />
    </div>
  );
}
