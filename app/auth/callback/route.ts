import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Lien expiré, déjà utilisé, ou invalide — on redirige vers la page de
  // connexion avec un message clair au lieu de planter en 404.
  if (error) {
    const message =
      errorDescription?.includes("expired")
        ? "expired"
        : "invalid";
    return NextResponse.redirect(`${origin}/login?confirm_error=${message}`);
  }

  if (code) {
    const supabase = createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      return NextResponse.redirect(`${origin}/login?confirm_error=invalid`);
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
