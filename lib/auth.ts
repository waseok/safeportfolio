import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/auth-utils";

export type { Role };

export interface AppUser {
  id: string;
  role: Role;
  name: string;
  grade: number | null;
  class_number: number | null;
  student_number: number | null;
  current_points: number;
  total_points: number;
  equipped_avatar_id: string | null;
}

/** 현재 로그인 사용자 + public.users 프로필 반환. 없으면 null */
export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (!profile) return null;
  return profile as AppUser;
}

export { getRedirectPath } from "@/lib/auth-utils";
