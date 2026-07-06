import type { SupabaseClient } from "@supabase/supabase-js";
import type { Role } from "@/lib/auth-utils";

/** 심사용 테스트 입장 쿠키 (배너 표시용) */
export const REVIEW_COOKIE = "safe_review_demo";

export const REVIEW_STUDENT_EMAIL = "student-test@safe.local";
export const REVIEW_TEACHER_EMAIL = "teacher-test@safe.local";
export const REVIEW_PASSWORD = "123456";
export const REVIEW_CLASS_CODE = "1234";

export type ReviewRole = "student" | "teacher";

export function isReviewRole(value: string | undefined | null): value is ReviewRole {
  return value === "student" || value === "teacher";
}

export function explainReviewDbError(message: string): string {
  if (message.includes("infinite recursion") || message.includes('policy for relation "users"')) {
    return "DB 정책(RLS) 충돌입니다. Supabase SQL Editor에서 최신 schema.sql을 다시 실행해 주세요.";
  }
  return message;
}

/** 브라우저에 심사 모드 쿠키 설정 (1일) */
export function setReviewDemoCookie(role: ReviewRole) {
  if (typeof document === "undefined") return;
  document.cookie = `${REVIEW_COOKIE}=${role}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearReviewDemoCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${REVIEW_COOKIE}=; path=/; max-age=0`;
}

/**
 * 심사용 원클릭 입장 — 테스트 계정으로 자동 로그인 (아이디·비밀번호 입력 불필요)
 */
export async function enterReviewDemo(
  supabase: SupabaseClient,
  role: ReviewRole,
): Promise<{ ok: true; redirectPath: string } | { ok: false; error: string }> {
  const email = role === "teacher" ? REVIEW_TEACHER_EMAIL : REVIEW_STUDENT_EMAIL;

  const res = await supabase.auth.signInWithPassword({
    email,
    password: REVIEW_PASSWORD,
  });

  let uid = res.data.user?.id ?? null;
  if (!uid && res.error) {
    const signUp = await supabase.auth.signUp({ email, password: REVIEW_PASSWORD });
    if (signUp.error || !signUp.data.user) {
      return { ok: false, error: signUp.error?.message ?? "테스트 계정 생성 실패" };
    }
    uid = signUp.data.user.id;
  }

  if (!uid) {
    return {
      ok: false,
      error: "입장에 실패했습니다. Supabase에서 Confirm email을 끄고 다시 시도하세요.",
    };
  }

  const authRole: Role = role === "teacher" ? "teacher" : "student";
  const studentProfile = {
    id: uid,
    role: authRole,
    name: "심사용 학생(데모)",
    student_number: 1,
    grade: 1,
    class_number: 1,
    current_points: 42,
    total_points: 68,
  };
  const teacherProfile = {
    id: uid,
    role: authRole,
    name: "심사용 교사(데모)",
  };

  const { error: upsertUserError } = await supabase.from("users").upsert(
    role === "student" ? studentProfile : teacherProfile,
    { onConflict: "id" },
  );
  if (upsertUserError) {
    return { ok: false, error: `프로필 저장 실패: ${explainReviewDbError(upsertUserError.message)}` };
  }

  if (role === "teacher") {
    const { data: cls } = await supabase
      .from("classes")
      .select("id")
      .eq("code", REVIEW_CLASS_CODE)
      .maybeSingle();
    if (!cls) {
      const { error: classInsertError } = await supabase.from("classes").insert({
        teacher_id: uid,
        code: REVIEW_CLASS_CODE,
        name: "심사용 테스트 학급",
        grade: 1,
        class_number: 1,
      });
      if (classInsertError) {
        return { ok: false, error: `학급 생성 실패: ${explainReviewDbError(classInsertError.message)}` };
      }
    }
  } else {
    const { data: cls } = await supabase
      .from("classes")
      .select("id")
      .eq("code", REVIEW_CLASS_CODE)
      .maybeSingle();
    if (cls) {
      const { error: joinClassError } = await supabase
        .from("users")
        .update({ class_id: cls.id })
        .eq("id", uid);
      if (joinClassError) {
        return { ok: false, error: `학급 연결 실패: ${explainReviewDbError(joinClassError.message)}` };
      }
    }
  }

  setReviewDemoCookie(role);
  return {
    ok: true,
    redirectPath: role === "teacher" ? "/admin" : "/dashboard",
  };
}
