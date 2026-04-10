import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 관리자 API에서 교사 권한을 확인합니다.
 * 로그인은 되었으나 public.users 행이 없는 경우(배포 환경에서 가입/로그인 흐름 불일치 등),
 * 이 앱의 교사 이메일 규칙(teacher-*@safe.local)이면 서비스 롤로 프로필을 한 번 보강합니다.
 */
export async function assertTeacherForAdminApi(
  supabase: SupabaseClient,
  user: { id: string; email?: string | null }
): Promise<
  | { ok: true }
  | { ok: false; error: string; status: 403 | 500 }
> {
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "teacher") {
    return { ok: true };
  }
  if (profile?.role === "student") {
    return {
      ok: false,
      error: "교사만 이 작업을 할 수 있습니다.",
      status: 403,
    };
  }

  const email = (user.email ?? "").toLowerCase();
  const local = email.split("@")[0] ?? "";
  const looksLikeAppTeacher =
    local.startsWith("teacher-") && email.endsWith("@safe.local");

  if (!looksLikeAppTeacher) {
    return {
      ok: false,
      error:
        "교사 프로필이 없습니다. 로그아웃 후 다시 로그인하거나 회원가입을 완료해 주세요.",
      status: 403,
    };
  }

  const { error: upsertError } = await supabase.from("users").upsert(
    {
      id: user.id,
      role: "teacher",
      // 이메일 로컬파트로 표시 이름 보관(실제 아이디와 다를 수 있으나 목록/식별용)
      name: local.slice(0, 80) || "교사",
    },
    { onConflict: "id" }
  );

  if (upsertError) {
    console.error("[assertTeacherForAdminApi] users upsert failed:", upsertError);
    return {
      ok: false,
      error: "교사 프로필을 준비하는 데 실패했습니다.",
      status: 500,
    };
  }

  return { ok: true };
}
