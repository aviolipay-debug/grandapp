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
      initialPinHash={profile?.finance_pin_hash ?? null}
    />
  );
}
