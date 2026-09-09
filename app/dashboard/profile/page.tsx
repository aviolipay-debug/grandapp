// app/dashboard/profile/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("finance_pin_hash")
    .eq("id", user.id)
    .single();

  return (
    <ProfileForm
      initialEmail={user.email ?? ""}
      initialFullName={(user.user_metadata?.full_name as string) ?? ""}
      // On ne transmet plus jamais le hash lui-même au client — seulement le
      // fait qu'un PIN existe ou non. La vérification/mise à jour du PIN se
      // fait désormais entièrement côté serveur (voir ./actions.ts).
      initialHasPin={!!profile?.finance_pin_hash}
    />
  );
}
