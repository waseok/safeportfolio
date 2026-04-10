"use client";

import { createClient } from "@/lib/supabase/client";
import { getRedirectPath, type Role } from "@/lib/auth-utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

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

type LoginMode = "select" | "student" | "teacher";

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>("select");
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
      if (!uid) { setError("입장에 실패했습니다. Supabase Confirm email을 끄고 다시 시도하세요."); return; }
      const role: Role = kind === "teacher" ? "teacher" : "student";
      const studentProfile = kind === "student"
        ? { id: uid, role, name: "이동수", student_number: 5, grade: 1, class_number: 1, current_points: 25, total_points: 48 }
        : { id: uid, role, name: "테스트 교사" };
      const { error: upsertUserError } = await supabase.from("users").upsert(
        studentProfile,
        { onConflict: "id" }
      );
      if (upsertUserError) { setError(`프로필 저장 실패: ${explainDbError(upsertUserError.message)}`); return; }
      if (kind === "teacher") {
        const { data: cls } = await supabase.from("classes").select("id").eq("code", "1234").maybeSingle();
        if (!cls) {
          const { error: classInsertError } = await supabase.from("classes").insert({ teacher_id: uid, code: "1234", name: "테스트 학급", grade: 1, class_number: 1 });
          if (classInsertError) { setError(`학급 생성 실패: ${explainDbError(classInsertError.message)}`); return; }
        }
      } else {
        const { data: cls } = await supabase.from("classes").select("id").eq("code", "1234").maybeSingle();
        if (cls) {
          const { error: joinClassError } = await supabase.from("users").update({ class_id: cls.id }).eq("id", uid);
          if (joinClassError) { setError(`학급 연결 실패: ${explainDbError(joinClassError.message)}`); return; }
        }
      }
      router.push(getRedirectPath(role));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "입장 중 오류");
    } finally {
      setLoading(false);
    }
  }

  async function handleTeacherLogin(e: React.FormEvent) {
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
      if (!uid) { setError("로그인에 실패했습니다."); return; }
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
      setError(e instanceof Error ? e.message : "로그인 처리 중 오류");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6"
      style={{ background: "linear-gradient(160deg, #e8f4fd 0%, #dbeafe 40%, #c7d9f0 100%)" }}>

      {/* 로고 + 타이틀 */}
      <div className="mb-10 flex flex-col items-center text-center">
        <Image
          src="/logo.png"
          alt="SAFE 프로그램 로고"
          width={160}
          height={160}
          className="mb-4 drop-shadow-lg"
          priority
        />
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
          SAFE 프로그램 포트폴리오
        </h1>
        <p className="mt-2 text-base text-slate-500 font-medium">
          스스로 묻고 함께 실천하는 안전 탐사 기록
        </p>
      </div>

      {/* 모드 선택 카드 */}
      <div className="w-full max-w-md">
        {mode === "select" && (
          <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-8 shadow-xl border border-slate-200/60 space-y-4">
            <button
              type="button"
              onClick={() => quickLogin("student")}
              disabled={loading}
              className="flex w-full items-center gap-4 rounded-xl border-2 border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50 px-5 py-4 text-left transition hover:border-sky-400 hover:shadow-md disabled:opacity-50"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-2xl">
                🎒
              </span>
              <div>
                <p className="text-lg font-bold text-slate-800">학생 로그인</p>
                <p className="text-sm text-slate-500">학급코드로 입장합니다</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode("teacher")}
              disabled={loading}
              className="flex w-full items-center gap-4 rounded-xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-slate-50 px-5 py-4 text-left transition hover:border-indigo-400 hover:shadow-md disabled:opacity-50"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-2xl">
                👩‍🏫
              </span>
              <div>
                <p className="text-lg font-bold text-slate-800">교사 로그인</p>
                <p className="text-sm text-slate-500">아이디와 비밀번호로 로그인합니다</p>
              </div>
            </button>

            {error && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {loading && (
              <p className="text-center text-sm text-slate-400">로그인 중...</p>
            )}
          </div>
        )}

        {mode === "teacher" && (
          <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-8 shadow-xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => { setMode("select"); setError(null); }}
              className="mb-4 text-sm text-slate-400 hover:text-slate-600 transition"
            >
              ← 돌아가기
            </button>
            <h2 className="mb-6 text-xl font-bold text-slate-800">교사 로그인</h2>
            <form onSubmit={handleTeacherLogin} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">아이디</label>
                <input
                  type="text"
                  placeholder="아이디를 입력하세요"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">비밀번호</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="숫자 6자리"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm tracking-[0.3em] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
                  required
                />
              </div>
              {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "로그인 중…" : "로그인"}
              </button>
            </form>
            <p className="mt-5 text-center text-sm text-slate-400">
              처음이신가요?{" "}
              <a href="/signup" className="font-semibold text-indigo-500 hover:underline">
                회원가입
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
