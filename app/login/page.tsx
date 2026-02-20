"use client";

import { createClient } from "@/lib/supabase/client";
import { getRedirectPath, type Role } from "@/lib/auth-utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

function toTeacherEmail(id: string): string {
  const safe = id.trim().toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 30) || "user";
  return `teacher-${safe}@safe.local`;
}

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 테스트 입장: 입력 없이 고정 계정으로 바로 입장
  async function quickLogin(kind: "teacher" | "student") {
    const email = kind === "teacher" ? "teacher-test@safe.local" : "student-test@safe.local";
    const pw = "123456";
    setError(null);
    setLoading(true);
    const supabase = createClient();
    try {
      let res = await supabase.auth.signInWithPassword({ email, password: pw });
      let uid = res.data.user?.id ?? null;
      if (!uid && res.error) {
        const signUp = await supabase.auth.signUp({ email, password: pw });
        if (signUp.error || !signUp.data.user) {
          setError(signUp.error?.message ?? "테스트 계정 생성 실패");
          return;
        }
        uid = signUp.data.user.id;
      }
      if (!uid) {
        setError("테스트 입장에 실패했습니다. Supabase Confirm email을 끄고 다시 시도하세요.");
        return;
      }
      const role: Role = kind === "teacher" ? "teacher" : "student";
      await supabase.from("users").upsert(
        { id: uid, role, name: kind === "teacher" ? "테스트 교사" : "테스트 학생" },
        { onConflict: "id" }
      );
      if (kind === "teacher") {
        const { data: cls } = await supabase.from("classes").select("id").eq("code", "1234").maybeSingle();
        if (!cls) {
          await supabase.from("classes").insert({
            teacher_id: uid,
            code: "1234",
            name: "테스트 학급",
            grade: 1,
            class_number: 1,
          });
        }
      } else {
        const { data: cls } = await supabase.from("classes").select("id").eq("code", "1234").maybeSingle();
        if (cls) {
          await supabase.from("users").update({ class_id: cls.id }).eq("id", uid);
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
    if (!id) {
      setError("아이디를 입력해 주세요.");
      setLoading(false);
      return;
    }
    if (pw.length !== 6) {
      setError("비밀번호는 숫자 6자리로 입력해 주세요.");
      setLoading(false);
      return;
    }

    const email = toTeacherEmail(id);
    const supabase = createClient();
    try {
      const { data: signData, error: signError } = await supabase.auth.signInWithPassword({
        email,
        password: pw,
      });
      if (signError) {
        setError(signError.message);
        return;
      }
      const uid = signData.user?.id;
      if (!uid) {
        setError("로그인에 실패했습니다. Supabase에서 Confirm email을 끄고 다시 시도하세요.");
        return;
      }

      const { data: profile } = await supabase.from("users").select("role").eq("id", uid).single();
      if (!profile) {
        await supabase.from("users").upsert(
          { id: uid, role: "teacher", name: id },
          { onConflict: "id" }
        );
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-amber-50/80 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-amber-200 bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-amber-900">
          로그인
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="아이디"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="rounded-lg border border-amber-200 px-4 py-2 focus:border-amber-500 focus:outline-none"
            required
          />
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            placeholder="비밀번호 (숫자 6자리)"
            value={password}
            onChange={(e) => setPassword(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="rounded-lg border border-amber-200 px-4 py-2 text-center tracking-[0.3em] focus:border-amber-500 focus:outline-none"
            required
          />
          {error && (
            <div role="alert" className="rounded-lg border-2 border-red-300 bg-red-50 p-3 text-sm text-red-700">
              오류: {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-amber-500 py-2 font-medium text-white hover:bg-amber-600 disabled:opacity-50"
          >
            {loading ? "로그인 중…" : "로그인"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-amber-800/80">
          처음이신가요?{" "}
          <Link href="/signup" className="font-medium text-amber-600 underline">
            교사 회원가입
          </Link>
        </p>
        <div className="mt-4 flex flex-col gap-2 border-t border-amber-100 pt-4">
          <p className="text-center text-xs text-amber-700/80">
            테스트: 아래 버튼만 누르면 바로 입장
          </p>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => quickLogin("teacher")}
              disabled={loading}
              className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800 hover:bg-amber-100 disabled:opacity-50"
            >
              교사 테스트 입장
            </button>
            <button
              type="button"
              onClick={() => quickLogin("student")}
              disabled={loading}
              className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800 hover:bg-amber-100 disabled:opacity-50"
            >
              학생 테스트 입장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
