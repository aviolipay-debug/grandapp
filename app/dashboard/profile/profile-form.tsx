// app/dashboard/profile/profile-form.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Lock, ShieldCheck, AlertTriangle, LogOut, Eye, EyeOff, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isValidPin } from "@/lib/pin";
import { setFinancePin, verifyOldFinancePin } from "./actions";

const RESET_CONFIRM_WORD = "SUPPRIMER";

export default function ProfileForm({
  initialEmail,
  initialFullName,
  initialCompanyName,
  initialHasPin,
}: {
  initialEmail: string;
  initialFullName: string;
  initialCompanyName: string;
  initialHasPin: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [email] = useState(initialEmail);
  const [fullName] = useState(initialFullName);
  const [companyName] = useState(initialCompanyName);

  // Code PIN de la page Finances — on ne connaît plus que son existence
  // (booléen), jamais son hash : la vérification et la mise à jour se font
  // entièrement côté serveur via la Server Action setFinancePin (./actions.ts).
  const [hasPin, setHasPin] = useState(initialHasPin);
  // pinStep ne concerne que la modification (hasPin=true) : "verify" affiche
  // le champ ancien code, "newPin" n'apparaît qu'une fois celui-ci validé.
  const [pinStep, setPinStep] = useState<"verify" | "newPin">("verify");
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newPinConfirm, setNewPinConfirm] = useState("");
  const [pinSaving, setPinSaving] = useState(false);
  const [pinSaved, setPinSaved] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Popup de code PIN — masqué par défaut, ouvert via le bouton.
  const [showPinModal, setShowPinModal] = useState(false);

  function openPinModal() {
    setPinStep("verify");
    setOldPin("");
    setNewPin("");
    setNewPinConfirm("");
    setPinError(null);
    setPinSaved(false);
    setShowPinModal(true);
  }

  // Changement de mot de passe.
  const [showPasswordMobileOpen, setShowPasswordMobileOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

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

    // Le menu déroulant se ferme tout seul une fois le mot de passe changé,
    // après un court délai pour laisser voir la confirmation.
    setTimeout(() => {
      setShowPasswordMobileOpen(false);
      setPasswordSaved(false);
    }, 900);
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

    setResetLoading(false);
    setShowResetModal(false);
    router.push("/dashboard");
    router.refresh();
  }

  async function handleVerifyOldPin(e: React.FormEvent) {
    e.preventDefault();
    setPinError(null);

    if (!isValidPin(oldPin)) {
      setPinError("Entrez un code à 4 chiffres.");
      return;
    }

    setPinSaving(true);
    const result = await verifyOldFinancePin(oldPin);
    setPinSaving(false);

    if (!result.success) {
      setPinError(result.error ?? "Code incorrect.");
      return;
    }

    setPinError(null);
    setPinStep("newPin");
  }

  async function handleSavePin(e: React.FormEvent) {
    e.preventDefault();
    setPinError(null);
    setPinSaved(false);

    if (!isValidPin(newPin)) {
      setPinError("Le code doit contenir exactement 4 chiffres.");
      return;
    }

    // Pour une première définition, on demande une confirmation pour éviter
    // une faute de frappe qui bloquerait ensuite l'accès aux Finances.
    if (!hasPin && newPin !== newPinConfirm) {
      setPinError("Les deux codes ne correspondent pas.");
      return;
    }

    setPinSaving(true);

    // oldPin n'est transmis que pour une modification (déjà validé à
    // l'étape précédente) — le serveur le revérifie quand même avant
    // d'enregistrer. Voir app/dashboard/profile/actions.ts.
    const result = await setFinancePin(hasPin ? { oldPin, newPin } : { newPin });

    setPinSaving(false);

    if (!result.success) {
      setPinError(result.error ?? "Une erreur est survenue.");
      return;
    }

    setHasPin(true);
    setPinStep("verify");
    setOldPin("");
    setNewPin("");
    setNewPinConfirm("");
    setPinSaved(true);

    // Le popup se ferme tout seul une fois le code enregistré, après un
    // court délai pour laisser voir la confirmation.
    setTimeout(() => {
      setShowPinModal(false);
      setPinSaved(false);
    }, 900);
  }

  const initial = (fullName || email || "?").trim().charAt(0).toUpperCase();

  const labelClass = "mb-1.5 block text-sm font-semibold text-ink dark:text-white";

  // Champ classique (texte simple) plutôt qu'un style "4 cases + input
  // caché" : un champ visible reçoit le focus natif immédiatement, sans le
  // léger délai d'ouverture du clavier observé sur mobile avec un input de
  // taille quasi nulle superposé à des cases décoratives.
  function renderPinInput(
    value: string,
    setValue: (v: string) => void,
    autoFocus: boolean,
    hasError: boolean
  ) {
    return (
      <input
        type="password"
        inputMode="numeric"
        pattern="\d{4}"
        maxLength={4}
        autoFocus={autoFocus}
        disabled={pinSaving}
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/\D/g, "").slice(0, 4))}
        placeholder="••••"
        className={`w-full rounded-xl border bg-[#F7F7FB] px-4 py-3 text-center text-lg tracking-[0.5em] text-ink outline-none transition-colors focus:border-ledger dark:bg-[#2F2F2F] dark:text-white ${
          hasError ? "border-stamp" : "border-paperline dark:border-white/10"
        }`}
      />
    );
  }

  const passwordFieldsJSX = (
    <>
      <div>
        <label className={labelClass}>Mot de passe actuel</label>
        <div className="relative">
          <input
            type={showCurrentPassword ? "text" : "password"}
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
        <p className="rounded-xl bg-stamp/10 px-4 py-2.5 text-sm text-stamp">{passwordError}</p>
      )}
      {passwordSaved && !passwordError && (
        <p className="rounded-xl bg-[#E7FAF9] px-4 py-2.5 text-sm font-semibold text-[#00A6AC] dark:bg-white/5">
          Mot de passe mis à jour.
        </p>
      )}
    </>
  );

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 py-4 lg:max-w-2xl">
      <h1 className="font-display text-xl font-bold text-ink dark:text-white">Mon profil</h1>

      {/* Carte unique : identité, profil entreprise, sécurité PIN, mot de passe */}
      <div className="divide-y divide-paperline rounded-2xl border border-paperline bg-white dark:divide-white/10 dark:border-white/10 dark:bg-[#262626]">
        {/* Identité — le nom affiché est celui de l'entreprise */}
        <div className="flex items-center gap-4 p-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E9F23A] text-xl font-bold text-ink">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold text-ink dark:text-white">
              {companyName || fullName || "Utilisateur"}
            </p>
            <p className="truncate text-sm text-[#6B7280] dark:text-white/50">{email}</p>
          </div>
        </div>

        {/* Profil de l'entreprise (assistant existant) */}
        <Link
          href="/onboarding"
          className="flex items-center justify-between p-5 transition-colors hover:bg-[#F7F7FB] dark:hover:bg-white/5"
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

        {/* Code PIN de la page Finances — bouton discret, la saisie se fait en popup */}
        <div className="flex items-center justify-between p-5 sm:p-6">
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
            {hasPin ? (
              "Modifier"
            ) : (
              <>
                <span className="sm:hidden">Définir</span>
                <span className="hidden sm:inline">Définir un code PIN</span>
              </>
            )}
          </button>
        </div>

        {/* Mot de passe — menu déroulant inline (même comportement desktop et mobile) */}
        <div>
          <button
            type="button"
            onClick={() => setShowPasswordMobileOpen((v) => !v)}
            className="flex w-full items-center justify-between p-5 sm:p-6"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#2A89DA] dark:bg-white/10">
                <Lock size={18} />
              </span>
              <span className="text-left">
                <span className="block text-sm font-semibold text-ink dark:text-white">
                  Mot de passe
                </span>
                <span className="hidden text-xs text-[#6B7280] dark:text-white/50 sm:block">
                  Dernière modification non affichée
                </span>
              </span>
            </span>
            <ChevronDown
              size={18}
              className={`shrink-0 text-[#9CA3AF] transition-transform ${
                showPasswordMobileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {showPasswordMobileOpen && (
            <form
              onSubmit={handleChangePassword}
              className="flex flex-col gap-4 border-t border-paperline p-5 pt-4 dark:border-white/10 sm:p-6 sm:pt-4"
            >
              {passwordFieldsJSX}

              <div className="mt-1 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordMobileOpen(false)}
                  className="flex-1 rounded-xl border border-paperline py-3 text-sm font-semibold text-ink hover:bg-[#F7F7FB] dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="flex-1 rounded-xl bg-ledger-deep py-3 text-sm font-bold text-white transition-colors hover:bg-stamp disabled:opacity-60"
                >
                  {passwordSaving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

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

      {/* Popup de saisie du code PIN */}
      {showPinModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowPinModal(false)}
        >
          {hasPin && pinStep === "verify" ? (
            // Modification, étape 1 : valider l'ancien code (ou le code de
            // secours) avant de pouvoir en choisir un nouveau.
            <form
              onSubmit={handleVerifyOldPin}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-paperline bg-white p-6 dark:border-white/10 dark:bg-[#262626] sm:p-7"
            >
              <h2 className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#6B7280] dark:text-white/50">
                <ShieldCheck size={14} />
                Sécurité — Finances
              </h2>
              <p className="mb-5 text-sm text-[#6B7280] dark:text-white/50">
                Entrez votre code actuel (ou le code de secours) pour continuer.
              </p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className={labelClass}>Code actuel</label>
                  {renderPinInput(oldPin, setOldPin, true, !!pinError)}
                </div>

                {pinError && (
                  <p className="rounded-xl bg-stamp/10 px-4 py-2.5 text-sm text-stamp">{pinError}</p>
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
                    {pinSaving ? "Vérification…" : "Valider"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            // Définition (1 étape, code + confirmation) ou modification
            // étape 2 (nouveau code, une fois l'ancien déjà validé).
            <form
              onSubmit={handleSavePin}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-paperline bg-white p-6 dark:border-white/10 dark:bg-[#262626] sm:p-7"
            >
              <h2 className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#6B7280] dark:text-white/50">
                <ShieldCheck size={14} />
                Sécurité — Finances
              </h2>
              <p className="mb-5 text-sm text-[#6B7280] dark:text-white/50">
                {hasPin
                  ? "Choisissez votre nouveau code à 4 chiffres."
                  : "Définissez un code à 4 chiffres demandé à chaque ouverture de la page Finances."}
              </p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className={labelClass}>
                    {hasPin ? "Nouveau code PIN" : "Code PIN"}
                  </label>
                  {renderPinInput(newPin, setNewPin, true, !!pinError)}
                </div>

                {!hasPin && (
                  <div>
                    <label className={labelClass}>Confirmer le code</label>
                    {renderPinInput(newPinConfirm, setNewPinConfirm, false, !!pinError)}
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
                    onClick={() => (hasPin ? setPinStep("verify") : setShowPinModal(false))}
                    className="flex-1 rounded-xl border border-paperline py-3 text-sm font-semibold text-ink hover:bg-[#F7F7FB] dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                  >
                    {hasPin ? "Retour" : "Annuler"}
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
          )}
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
