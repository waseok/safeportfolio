import { createClient, createServiceClient } from "@/lib/supabase/server";
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
  class_id: string | null;
}

/** 현재 로그인 사용자 + public.users 프로필 반환. 없으면 null */
export async function getCurrentUser(): Promise<AppUser | null> {
  // anon 클라이언트: auth.getUser()만 사용 (세션 쿠키 검증)
  const auth = await createClient();
  const {
    data: { user: authUser },
  } = await auth.auth.getUser();
  if (!authUser) return null;

  // 서비스 클라이언트: users 테이블 조회 (RLS 재귀 hang 방지)
  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (!profile) return null;
  return profile as AppUser;
}

export { getRedirectPath } from "@/lib/auth-utils";
