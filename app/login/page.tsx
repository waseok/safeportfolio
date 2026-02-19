"use client";

import { createClient } from "@/lib/supabase/client";
import { getRedirectPath, type Role } from "@/lib/auth-utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function quickLogin(kind: "teacher" | "student") {
    const emailEnv =
      kind === "teacher"
        ? process.env.NEXT_PUBLIC_TEST_TEACHER_EMAIL
        : process.env.NEXT_PUBLIC_TEST_STUDENT_EMAIL;
    const passwordEnv =
      kind === "teacher"
        ? process.env.NEXT_PUBLIC_TEST_TEACHER_PASSWORD
        : process.env.NEXT_PUBLIC_TEST_STUDENT_PASSWORD;
    if (!emailEnv || !passwordEnv) {
      setError("테스트 계정 환경변수가 설정되어 있지 않습니다.");
      return;
    }
    setError(null);
    setLoading(true);
    const supabase = createClient();
    // 먼저 로그인 시도
    const signInResult = await supabase.auth.signInWithPassword({
      email: emailEnv,
      password: passwordEnv,
    });

    let userId = signInResult.data.user?.id ?? null;

    // 없으면 자동 회원가입
    if (!userId && signInResult.error) {
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: emailEnv,
          password: passwordEnv,
        });
      if (signUpError || !signUpData.user) {
        setError("테스트 계정을 만들 수 없습니다.");
        setLoading(false);
        return;
      }
      userId = signUpData.user.id;

      // users 테이블에 프로필 upsert
      const role: Role = kind === "teacher" ? "teacher" : "student";
      await supabase.from("users").upsert(
        {
          id: userId,
          role,
          name: role === "teacher" ? "테스트 교사" : "테스트 학생",
        },
        { onConflict: "id" }
      );
    }

    const role: Role = kind === "teacher" ? "teacher" : "student";
    router.push(getRedirectPath(role));
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: signError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signError) {
      setError(signError.message);
      setLoading(false);
      return;
    }
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .single();
    const role = (profile?.role ?? "student") as Role;
    router.push(getRedirectPath(role));
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-amber-50/80 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-amber-200 bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-amber-900">
          로그인
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-amber-200 px-4 py-2 focus:border-amber-500 focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-amber-200 px-4 py-2 focus:border-amber-500 focus:outline-none"
            required
          />
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-amber-500 py-2 font-medium text-white hover:bg-amber-600 disabled:opacity-50"
          >
            {loading ? "로그인 중…" : "로그인"}
          </button>
        </form>
        <div className="mt-4 space-y-2 text-center text-sm text-amber-800/80">
          <p>
            선생님이 처음이신가요?{" "}
            <Link
              href="/signup"
              className="font-medium text-amber-600 underline"
            >
              교사 회원가입
            </Link>
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <p className="text-xs text-amber-700/80">
              (개발용) 테스트 계정으로 바로 들어가기
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => quickLogin("teacher")}
                className="rounded-lg border border-amber-300 px-3 py-1 text-xs text-amber-800 hover:bg-amber-50"
              >
                교사 테스트 입장
              </button>
              <button
                type="button"
                onClick={() => quickLogin("student")}
                className="rounded-lg border border-amber-300 px-3 py-1 text-xs text-amber-800 hover:bg-amber-50"
              >
                학생 테스트 입장
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
