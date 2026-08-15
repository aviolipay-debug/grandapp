"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();
  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }
  return (
    <button
      onClick={handleSignOut}
      className="w-full rounded border border-paperline px-3 py-2 text-left text-sm font-medium text-[#374151] hover:bg-white"
    >
      Se déconnecter
    </button>
  );
}
