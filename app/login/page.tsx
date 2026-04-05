"use client";

import { createClient } from "@/lib/supabase/client";
import { getRedirectPath, type Role } from "@/lib/auth-utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

function shortHash(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function toTeacherEmail(id: string): string {
  const normalized = id.trim().toLowerCase();
  const ascii = normalized.replace(/[^a-z0-9]/g, "").slice(0, 20) || "user";
  const hash = shortHash(normalized);
  return `teacher-${ascii}-${hash}@safe.local`;
}

function explainDbError(message: string): string {
  if (message.includes("infinite recursion") || message.includes("policy for relation \"users\"")) {
    return "DB 정책(RLS) 충돌입니다. Supabase SQL Editor에서 최신 schema.sql을 다시 실행해 주세요.";
  }
  return message;
}

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function quickLogin(kind: "teacher" | "student") {
    const email = kind === "teacher" ? "teacher-test@safe.local" : "student-test@safe.local";
    const pw = "123456";
    setError(null);
    setLoading(true);
    const supabase = createClient();
    try {
      const res = await supabase.auth.signInWithPassword({ email, password: pw });
      let uid = res.data.user?.id ?? null;
      if (!uid && res.error) {
        const signUp = await supabase.auth.signUp({ email, password: pw });
        if (signUp.error || !signUp.data.user) { setError(signUp.error?.message ?? "테스트 계정 생성 실패"); return; }
        uid = signUp.data.user.id;
      }
      if (!uid) { setError("테스트 입장에 실패했습니다. Supabase Confirm email을 끄고 다시 시도하세요."); return; }
      const role: Role = kind === "teacher" ? "teacher" : "student";
      const studentProfile = kind === "student"
        ? { id: uid, role, name: "이동수", student_number: 5, grade: 1, class_number: 1, current_points: 45, total_points: 78 }
        : { id: uid, role, name: "테스트 교사" };
      const { error: upsertUserError } = await supabase.from("users").upsert(
        studentProfile,
        { onConflict: "id" }
      );
      if (upsertUserError) { setError(`테스트 프로필 저장 실패: ${explainDbError(upsertUserError.message)}`); return; }
      if (kind === "teacher") {
        const { data: cls } = await supabase.from("classes").select("id").eq("code", "1234").maybeSingle();
        if (!cls) {
          const { error: classInsertError } = await supabase.from("classes").insert({ teacher_id: uid, code: "1234", name: "테스트 학급", grade: 1, class_number: 1 });
          if (classInsertError) { setError(`테스트 학급 생성 실패: ${explainDbError(classInsertError.message)}`); return; }
        }
      } else {
        const { data: cls } = await supabase.from("classes").select("id").eq("code", "1234").maybeSingle();
        if (cls) {
          const { error: joinClassError } = await supabase.from("users").update({ class_id: cls.id }).eq("id", uid);
          if (joinClassError) { setError(`테스트 학생 학급 연결 실패: ${explainDbError(joinClassError.message)}`); return; }
        }
      }
      router.push(getRedirectPath(role));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "테스트 입장 중 오류");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const id = userId.trim();
    const pw = password.replace(/\D/g, "").slice(0, 6);
    if (!id) { setError("아이디를 입력해 주세요."); setLoading(false); return; }
    if (pw.length !== 6) { setError("비밀번호는 숫자 6자리로 입력해 주세요."); setLoading(false); return; }

    const email = toTeacherEmail(id);
    const supabase = createClient();
    try {
      const { data: signData, error: signError } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (signError) { setError(signError.message); return; }
      const uid = signData.user?.id;
      if (!uid) { setError("로그인에 실패했습니다. Supabase에서 Confirm email을 끄고 다시 시도하세요."); return; }
      const { data: profile, error: profileError } = await supabase.from("users").select("role").eq("id", uid).single();
      if (profileError && profileError.code !== "PGRST116") { setError(`프로필 조회 실패: ${explainDbError(profileError.message)}`); return; }
      if (!profile) {
        const { error: createProfileError } = await supabase.from("users").upsert({ id: uid, role: "teacher", name: id }, { onConflict: "id" });
        if (createProfileError) { setError(`프로필 저장 실패: ${explainDbError(createProfileError.message)}`); return; }
      }
      const role = (profile?.role ?? "teacher") as Role;
      router.push(getRedirectPath(role));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "로그인 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6"
      style={{background: "linear-gradient(180deg, #B8E4F9 0%, #C8E6F5 50%, #D4EDFF 100%)"}}>

      {/* 로고 영역 */}
      <div className="mb-8 text-center">
        <div className="text-7xl mb-3 animate-bounce-soft">🛡️</div>
        <h1 className="text-4xl font-black text-white drop-shadow-lg" style={{textShadow: "0 2px 8px rgba(0,100,180,0.3)"}}>안전 포트폴리오</h1>
        <p className="text-sky-800 text-base font-bold mt-2 bg-white/50 rounded-full px-4 py-1 inline-block">우리 모두의 안전한 하루를 기록해요 ✨</p>
      </div>

      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl border-2 border-white">
        <h2 className="mb-6 text-center text-xl font-black text-sky-800">
          👩‍🏫 교사 로그인
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="아이디"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="rounded-full border-2 border-sky-200 px-4 py-3 text-sm focus:border-sky-400 focus:outline-none bg-sky-50/50"
            required
          />
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            placeholder="비밀번호 (숫자 6자리)"
            value={password}
            onChange={(e) => setPassword(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="rounded-full border-2 border-sky-200 px-4 py-3 text-center text-sm tracking-[0.3em] focus:border-sky-400 focus:outline-none bg-sky-50/50"
            required
          />
          {error && (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              ⚠️ {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full py-3 font-black text-gray-900 shadow-lg transition hover:opacity-90 disabled:opacity-50"
            style={{background: "linear-gradient(135deg, #FFD700, #FFC107)"}}
          >
            {loading ? "로그인 중…" : "🚀 로그인"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          처음이신가요?{" "}
          <Link href="/signup" className="font-bold text-sky-600 hover:underline">
            교사 회원가입
          </Link>
        </p>

        <div className="mt-6 border-t border-sky-100 pt-5">
          <p className="text-center text-xs text-sky-500 mb-3 font-black uppercase tracking-wide">
            ⭐ 테스트 입장
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => quickLogin("teacher")}
              disabled={loading}
              className="rounded-full border-2 border-sky-300 bg-sky-50 px-3 py-2.5 text-sm font-black text-sky-800 hover:bg-sky-100 disabled:opacity-50 transition"
            >
              👩‍🏫 교사 입장
            </button>
            <button
              type="button"
              onClick={() => quickLogin("student")}
              disabled={loading}
              className="rounded-full border-2 border-yellow-300 px-3 py-2.5 text-sm font-black text-yellow-900 hover:opacity-90 disabled:opacity-50 transition shadow-sm"
              style={{background: "linear-gradient(135deg, #FFF9C4, #FFF176)"}}
            >
              🧒 학생 입장
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link href="/student-join"
          className="inline-flex items-center gap-2 rounded-full border-2 border-white bg-white/60 px-5 py-2.5 text-sm font-black text-sky-800 hover:bg-white/90 transition shadow-md">
          🧒 학생이에요 → 학급 코드로 입장
        </Link>
      </div>
    </div>
  );
}
