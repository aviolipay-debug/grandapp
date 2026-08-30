import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Destination après un échange réussi — /dashboard par défaut (inscription,
  // Google), ou une autre page si précisée (ex. réinitialisation de mot de
  // passe qui doit atterrir sur /reset-password/confirm).
  const next = searchParams.get("next");

  // Lien expiré, déjà utilisé, ou invalide — on redirige vers la page de
  // connexion (ou la page de demande de réinitialisation) avec un message
  // clair au lieu de planter en 404.
  if (error) {
    const message = errorDescription?.includes("expired") ? "expired" : "invalid";
    const base = next?.startsWith("/reset-password") ? "/reset-password" : "/login";
    return NextResponse.redirect(`${origin}${base}?confirm_error=${message}`);
  }

  if (code) {
    const supabase = createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      const base = next?.startsWith("/reset-password") ? "/reset-password" : "/login";
      return NextResponse.redirect(`${origin}${base}?confirm_error=invalid`);
    }
  }

  return NextResponse.redirect(`${origin}${next ?? "/dashboard"}`);
}
