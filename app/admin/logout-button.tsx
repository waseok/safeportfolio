"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-full border border-white/40 bg-white/20 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/30 transition-all"
    >
      로그아웃
    </button>
  );
}
