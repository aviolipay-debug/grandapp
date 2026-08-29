// app/dashboard/profile/profile-form.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, User, Phone, Building2, Lock, ShieldCheck, AlertTriangle, LogOut, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { hashPin, isValidPin } from "@/lib/pin";

const RESET_CONFIRM_WORD = "SUPPRIMER";

export default function ProfileForm({
  initialEmail,
  initialFullName,
  initialWhatsapp,
  initialPinHash,
}: {
  initialEmail: string;
  initialFullName: string;
  initialWhatsapp: string;
  initialPinHash: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email] = useState(initialEmail);
  const [fullName, setFullName] = useState(initialFullName);
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp);

  // Code PIN de la page Finances — déjà connu au premier rendu, plus de
  // fetch ni de flash "Chargement..." au montage.
  const [hasPin, setHasPin] = useState(!!initialPinHash);
  const [currentPinHash, setCurrentPinHash] = useState<string | null>(initialPinHash);
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newPinConfirm, setNewPinConfirm] = useState("");
  const [pinSaving, setPinSaving] = useState(false);
  const [pinSaved, setPinSaved] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Code de secours utilisable à la place de l'ancien PIN si l'utilisateur
  // l'a oublié.
  const DEFAULT_PIN = "8080";

  // Popup de code PIN — masqué par défaut, ouvert via le bouton.
  const [showPinModal, setShowPinModal] = useState(false);

  function openPinModal() {
    setOldPin("");
    setNewPin("");
    setNewPinConfirm("");
    setPinError(null);
    setPinSaved(false);
    setShowPinModal(true);
  }

  // Changement de mot de passe.
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  function openPasswordModal() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setPasswordError(null);
    setPasswordSaved(false);
    setShowPasswordModal(true);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSaved(false);

    if (!currentPassword) {
      setPasswordError("Entrez votre mot de passe actuel.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setPasswordSaving(true);

    // On vérifie le mot de passe actuel en tentant une connexion avec —
    // Supabase ne fournit pas de vérification directe sans ré-authentifier.
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (verifyError) {
      setPasswordSaving(false);
      setPasswordError("Mot de passe actuel incorrect.");
      return;
    }

    const { error: passwordUpdateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setPasswordSaving(false);

    if (passwordUpdateError) {
      setPasswordError(passwordUpdateError.message);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSaved(true);
  }

  // Réinitialisation du compte — supprime toutes les données métier
  // (clients, projets, devis, factures, paiements) mais garde la
  // configuration du compte (profil, entreprise, PIN).
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  function openResetModal() {
    setResetConfirmText("");
    setResetError(null);
    setShowResetModal(true);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function handleResetAccount() {
    setResetError(null);

    if (resetConfirmText.trim().toUpperCase() !== RESET_CONFIRM_WORD) {
      setResetError(`Tapez exactement "${RESET_CONFIRM_WORD}" pour confirmer.`);
      return;
    }

    setResetLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setResetError("Session expirée, reconnectez-vous.");
      setResetLoading(false);
      return;
    }

    // Ordre de suppression : enfants d'abord, pour éviter les erreurs de
    // clé étrangère même si aucune suppression en cascade n'est configurée
    // côté base de données.
    const { data: quotesOwned } = await supabase
      .from("quotes")
      .select("id")
      .eq("owner_id", user.id);
    const quoteIds = (quotesOwned ?? []).map((q) => q.id);

    const { data: invoicesOwned } = await supabase
      .from("invoices")
      .select("id")
      .eq("owner_id", user.id);
    const invoiceIds = (invoicesOwned ?? []).map((i) => i.id);

    if (invoiceIds.length > 0) {
      const { error: paymentsError } = await supabase
        .from("payments")
        .delete()
        .in("invoice_id", invoiceIds);
      if (paymentsError) {
        setResetError(`Étape paiements : ${paymentsError.message}`);
        setResetLoading(false);
        return;
      }
    }

    if (quoteIds.length > 0) {
      const { error: itemsError } = await supabase
        .from("quote_items")
        .delete()
        .in("quote_id", quoteIds);
      if (itemsError) {
        setResetError(`Étape lignes de devis : ${itemsError.message}`);
        setResetLoading(false);
        return;
      }
    }

    const { error: invoicesError } = await supabase
      .from("invoices")
      .delete()
      .eq("owner_id", user.id);
    if (invoicesError) {
      setResetError(`Étape factures : ${invoicesError.message}`);
      setResetLoading(false);
      return;
    }

    const { error: quotesError } = await supabase
      .from("quotes")
      .delete()
      .eq("owner_id", user.id);
    if (quotesError) {
      setResetError(`Étape devis : ${quotesError.message}`);
      setResetLoading(false);
      return;
    }

    const { error: projectsError } = await supabase
      .from("projects")
      .delete()
      .eq("owner_id", user.id);
    if (projectsError) {
      setResetError(`Étape projets : ${projectsError.message}`);
      setResetLoading(false);
      return;
    }

    const { error: clientsError } = await supabase
      .from("clients")
      .delete()
      .eq("owner_id", user.id);
    if (clientsError) {
      setResetError(`Étape clients : ${clientsError.message}`);
      setResetLoading(false);
      return;
    }

    // Le code PIN est aussi effacé — un nouveau devra être défini.
    const { error: pinResetError } = await supabase
      .from("profiles")
      .update({ finance_pin_hash: null })
      .eq("id", user.id);
    if (pinResetError) {
      setResetError(`Étape code PIN : ${pinResetError.message}`);
      setResetLoading(false);
      return;
    }
    setHasPin(false);
    setCurrentPinHash(null);

    setResetLoading(false);
    setShowResetModal(false);
    router.push("/dashboard");
    router.refresh();
  }

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

  async function handleSavePin(e: React.FormEvent) {
    e.preventDefault();
    setPinError(null);
    setPinSaved(false);

    // Si un code existe déjà, il faut d'abord prouver qu'on le connaît —
    // soit l'ancien code exact, soit le code de secours par défaut.
    if (hasPin) {
      if (!isValidPin(oldPin)) {
        setPinError("Entrez votre ancien code (4 chiffres).");
        return;
      }
      const oldPinMatches =
        oldPin === DEFAULT_PIN ||
        (currentPinHash && (await hashPin(oldPin)) === currentPinHash);
      if (!oldPinMatches) {
        setPinError("Ancien code incorrect.");
        return;
      }
    }

    if (!isValidPin(newPin)) {
      setPinError("Le nouveau code doit contenir exactement 4 chiffres.");
      return;
    }

    // Pour une première définition, on demande une confirmation pour éviter
    // une faute de frappe qui bloquerait ensuite l'accès aux Finances.
    if (!hasPin && newPin !== newPinConfirm) {
      setPinError("Les deux codes ne correspondent pas.");
      return;
    }

    setPinSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setPinError("Session expirée, reconnectez-vous.");
      setPinSaving(false);
      return;
    }

    const finance_pin_hash = await hashPin(newPin);

    const { error: pinUpdateError } = await supabase
      .from("profiles")
      .update({ finance_pin_hash })
      .eq("id", user.id);

    setPinSaving(false);

    if (pinUpdateError) {
      setPinError(pinUpdateError.message);
      return;
    }

    setHasPin(true);
    setCurrentPinHash(finance_pin_hash);
    setOldPin("");
    setNewPin("");
    setNewPinConfirm("");
    setPinSaved(true);
  }

  const initial = (fullName || email || "?").trim().charAt(0).toUpperCase();

  const inputClass =
    "w-full rounded-xl border border-paperline bg-[#F7F7FB] px-4 py-3 pl-11 text-sm text-ink outline-none transition-colors focus:border-ledger dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white";
  const labelClass = "mb-1.5 block text-sm font-semibold text-ink dark:text-white";

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

      {/* Code PIN de la page Finances — bouton discret, la saisie se fait en popup */}
      <div className="flex items-center justify-between rounded-2xl border border-paperline bg-white p-5 dark:border-white/10 dark:bg-[#262626] sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3EEFC] text-[#5B21B6] dark:bg-white/10">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink dark:text-white">Sécurité — Finances</p>
            <p className="text-xs text-[#6B7280] dark:text-white/50">
              {hasPin ? "Code PIN activé" : "Aucun code PIN défini"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openPinModal}
          className="shrink-0 rounded-lg bg-ledger-deep px-3.5 py-2 text-sm font-semibold text-white hover:bg-stamp"
        >
          {hasPin ? "Modifier" : "Définir un code PIN"}
        </button>
      </div>

      {/* Mot de passe */}
      <div className="flex items-center justify-between rounded-2xl border border-paperline bg-white p-5 dark:border-white/10 dark:bg-[#262626] sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#2A89DA] dark:bg-white/10">
            <Lock size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink dark:text-white">Mot de passe</p>
            <p className="text-xs text-[#6B7280] dark:text-white/50">
              Dernière modification non affichée
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openPasswordModal}
          className="shrink-0 rounded-lg bg-ledger-deep px-3.5 py-2 text-sm font-semibold text-white hover:bg-stamp"
        >
          Changer le mot de passe
        </button>
      </div>

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

      {/* Déconnexion */}
      <button
        type="button"
        onClick={handleSignOut}
        className="flex items-center justify-center gap-2 rounded-xl border border-paperline py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-[#F7F7FB] dark:border-white/10 dark:text-white dark:hover:bg-white/5"
      >
        <LogOut size={16} />
        Se déconnecter
      </button>

      {/* Zone dangereuse */}
      <button
        type="button"
        onClick={openResetModal}
        className="flex items-center justify-center gap-2 rounded-xl border-[1.5px] border-stamp bg-stamp/5 py-3.5 text-sm font-bold text-stamp transition-colors hover:bg-stamp hover:text-white"
      >
        <AlertTriangle size={16} />
        Réinitialiser mon compte
      </button>

      {/* Popup de changement de mot de passe */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowPasswordModal(false)}
        >
          <form
            onSubmit={handleChangePassword}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-paperline bg-white p-6 dark:border-white/10 dark:bg-[#262626] sm:p-7"
          >
            <h2 className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#6B7280] dark:text-white/50">
              <Lock size={14} />
              Mot de passe
            </h2>
            <p className="mb-5 text-sm text-[#6B7280] dark:text-white/50">
              Entrez votre mot de passe actuel, puis choisissez-en un nouveau (6 caractères
              minimum).
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <label className={labelClass}>Mot de passe actuel</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    autoFocus
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-paperline bg-[#F7F7FB] px-4 py-3 pr-11 text-sm text-ink outline-none transition-colors focus:border-ledger dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((v) => !v)}
                    aria-label={showCurrentPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-ink dark:hover:text-white"
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className={labelClass}>Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-paperline bg-[#F7F7FB] px-4 py-3 pr-11 text-sm text-ink outline-none transition-colors focus:border-ledger dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    aria-label={showNewPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-ink dark:hover:text-white"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className={labelClass}>Confirmer le mot de passe</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-paperline bg-[#F7F7FB] px-4 py-3 pr-11 text-sm text-ink outline-none transition-colors focus:border-ledger dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-ink dark:hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <p className="rounded-xl bg-stamp/10 px-4 py-2.5 text-sm text-stamp">
                  {passwordError}
                </p>
              )}
              {passwordSaved && !passwordError && (
                <p className="rounded-xl bg-[#E7FAF9] px-4 py-2.5 text-sm font-semibold text-[#00A6AC] dark:bg-white/5">
                  Mot de passe mis à jour.
                </p>
              )}

              <div className="mt-1 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 rounded-xl border border-paperline py-3 text-sm font-semibold text-ink hover:bg-[#F7F7FB] dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="flex-1 rounded-xl bg-ledger-deep py-3 text-sm font-bold text-white transition-colors hover:bg-stamp disabled:opacity-60"
                >
                  {passwordSaving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Popup de saisie du code PIN */}
      {showPinModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowPinModal(false)}
        >
          <form
            onSubmit={async (e) => {
              await handleSavePin(e);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-paperline bg-white p-6 dark:border-white/10 dark:bg-[#262626] sm:p-7"
          >
            <h2 className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#6B7280] dark:text-white/50">
              <ShieldCheck size={14} />
              Sécurité — Finances
            </h2>
            <p className="mb-5 text-sm text-[#6B7280] dark:text-white/50">
              {hasPin
                ? "Entrez votre ancien code, puis choisissez-en un nouveau."
                : "Définissez un code à 4 chiffres demandé à chaque ouverture de la page Finances."}
            </p>

            <div className="flex flex-col gap-4">
              {hasPin && (
                <div>
                  <label className={labelClass}>Ancien code PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="\d{4}"
                    maxLength={4}
                    autoFocus
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="••••"
                    className="w-full rounded-xl border border-paperline bg-[#F7F7FB] px-4 py-3 text-center text-lg tracking-[0.5em] text-ink outline-none transition-colors focus:border-ledger dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className={labelClass}>{hasPin ? "Nouveau code PIN" : "Code PIN"}</label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={4}
                  autoFocus={!hasPin}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="••••"
                  className="w-full rounded-xl border border-paperline bg-[#F7F7FB] px-4 py-3 text-center text-lg tracking-[0.5em] text-ink outline-none transition-colors focus:border-ledger dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white"
                />
              </div>

              {!hasPin && (
                <div>
                  <label className={labelClass}>Confirmer le code</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="\d{4}"
                    maxLength={4}
                    value={newPinConfirm}
                    onChange={(e) => setNewPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="••••"
                    className="w-full rounded-xl border border-paperline bg-[#F7F7FB] px-4 py-3 text-center text-lg tracking-[0.5em] text-ink outline-none transition-colors focus:border-ledger dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white"
                  />
                </div>
              )}

              {pinError && (
                <p className="rounded-xl bg-stamp/10 px-4 py-2.5 text-sm text-stamp">{pinError}</p>
              )}
              {pinSaved && !pinError && (
                <p className="rounded-xl bg-[#E7FAF9] px-4 py-2.5 text-sm font-semibold text-[#00A6AC] dark:bg-white/5">
                  Code PIN enregistré.
                </p>
              )}

              <div className="mt-1 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 rounded-xl border border-paperline py-3 text-sm font-semibold text-ink hover:bg-[#F7F7FB] dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={pinSaving}
                  className="flex-1 rounded-xl bg-ledger-deep py-3 text-sm font-bold text-white transition-colors hover:bg-stamp disabled:opacity-60"
                >
                  {pinSaving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Popup d'avertissement — réinitialisation du compte */}
      {showResetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => !resetLoading && setShowResetModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-paperline bg-white p-6 dark:border-white/10 dark:bg-[#262626] sm:p-7"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-stamp/15 text-stamp">
              <AlertTriangle size={22} />
            </div>
            <h2 className="text-center font-display text-lg font-bold text-ink dark:text-white">
              Réinitialiser le compte ?
            </h2>
            <p className="mt-2 text-center text-sm text-[#6B7280] dark:text-white/50">
              Tous vos clients, projets, devis, factures et paiements seront{" "}
              <span className="font-semibold text-stamp">définitivement supprimés</span>, ainsi
              que votre code PIN (à redéfinir ensuite). Votre profil et votre entreprise
              resteront intacts. Cette action est irréversible.
            </p>

            <div className="mt-5">
              <label className={labelClass}>
                Tapez <span className="font-mono font-bold">{RESET_CONFIRM_WORD}</span> pour
                confirmer
              </label>
              <input
                type="text"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder={RESET_CONFIRM_WORD}
                autoFocus
                disabled={resetLoading}
                className="w-full rounded-xl border border-paperline bg-[#F7F7FB] px-4 py-3 text-center text-sm uppercase tracking-widest text-ink outline-none transition-colors focus:border-stamp dark:border-white/10 dark:bg-[#2F2F2F] dark:text-white"
              />
            </div>

            {resetError && (
              <p className="mt-3 rounded-xl bg-stamp/10 px-4 py-2.5 text-sm text-stamp">
                {resetError}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                disabled={resetLoading}
                className="flex-1 rounded-xl border border-paperline py-3 text-sm font-semibold text-ink hover:bg-[#F7F7FB] disabled:opacity-60 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleResetAccount}
                disabled={resetLoading}
                className="flex-1 rounded-xl bg-stamp py-3 text-sm font-bold text-white transition-colors hover:bg-stamp/90 disabled:opacity-60"
              >
                {resetLoading ? "Suppression…" : "Tout supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
