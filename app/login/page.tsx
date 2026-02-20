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
  const [testEmail, setTestEmail] = useState("");
  const [testPassword, setTestPassword] = useState("");
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
    const useEmail = emailEnv || testEmail.trim();
    const usePassword = passwordEnv || testPassword;
    if (!useEmail || !usePassword) {
      setError(
        "테스트 이메일·비밀번호를 아래 칸에 입력하거나, Vercel 환경 변수에 NEXT_PUBLIC_TEST_TEACHER_EMAIL 등 4개를 설정하세요."
      );
      return;
    }
    setError(null);
    setLoading(true);
    const supabase = createClient();
    try {
      const signInResult = await supabase.auth.signInWithPassword({
        email: useEmail,
        password: usePassword,
      });

      let userId = signInResult.data.user?.id ?? null;

      if (!userId && signInResult.error) {
        const { data: signUpData, error: signUpError } =
          await supabase.auth.signUp({
            email: useEmail,
            password: usePassword,
          });
        if (signUpError || !signUpData.user) {
          setError(signUpError?.message ?? "테스트 계정을 만들 수 없습니다.");
          return;
        }
        userId = signUpData.user.id;
      }

      if (!userId) {
        setError("이메일 인증이 켜져 있을 수 있습니다. Supabase에서 Confirm email을 끄거나, 위에서 직접 이메일·비밀번호로 로그인하세요.");
        return;
      }

      const role: Role = kind === "teacher" ? "teacher" : "student";
      await supabase.from("users").upsert(
        {
          id: userId,
          role,
          name: role === "teacher" ? "테스트 교사" : "테스트 학생",
        },
        { onConflict: "id" }
      );

      router.push(getRedirectPath(role));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "테스트 입장 중 오류가 났습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError("Supabase 설정이 없습니다. Vercel → 프로젝트 → Settings → Environment Variables에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를 추가한 뒤 반드시 Redeploy 하세요.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    try {
      const signInPromise = supabase.auth.signInWithPassword({ email, password });
      const timeoutMs = 10000;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT")), timeoutMs)
      );
      const { data: signData, error: signError } = await Promise.race([
        signInPromise,
        timeoutPromise,
      ]).catch((err) => {
        if (err?.message === "TIMEOUT") {
          throw new Error(`연결 시간이 초과되었습니다(${timeoutMs / 1000}초). Supabase URL·anon key·Redirect URL을 확인하세요.`);
        }
        throw err;
      }) as Awaited<typeof signInPromise>;

      if (signError) {
        setError(signError.message);
        return;
      }
      const userId = signData.user?.id;
      if (!userId) {
        setError("로그인에 실패했습니다. Supabase 대시보드 → Authentication → Email에서 Confirm email을 끄고 다시 시도하세요.");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (!profile) {
        await supabase.from("users").upsert(
          {
            id: userId,
            role: "teacher",
            name: email.split("@")[0] || "교사",
          },
          { onConflict: "id" }
        );
      }

      const role = (profile?.role ?? "teacher") as Role;
      router.push(getRedirectPath(role));
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "로그인 처리 중 오류가 발생했습니다.";
      setError(msg);
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
            <div
              role="alert"
              className="rounded-lg border-2 border-red-300 bg-red-50 p-3 text-sm font-medium text-red-700"
            >
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
          {loading && (
            <p className="text-center text-xs text-amber-700/80">
              10초 이상 걸리면 연결 문제입니다. 오류 메시지가 위에 뜹니다.
            </p>
          )}
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
            {!(process.env.NEXT_PUBLIC_TEST_TEACHER_EMAIL && process.env.NEXT_PUBLIC_TEST_TEACHER_PASSWORD) && (
              <div className="flex flex-col gap-1 rounded-lg bg-amber-50/80 p-2">
                <input
                  type="email"
                  placeholder="테스트 이메일"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="rounded border border-amber-200 px-2 py-1 text-xs"
                />
                <input
                  type="password"
                  placeholder="테스트 비밀번호"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  className="rounded border border-amber-200 px-2 py-1 text-xs"
                />
                <p className="text-[10px] text-amber-700/80">
                  환경 변수 없이 사용: 위 칸에 입력 후 아래 버튼 클릭 (없는 계정이면 자동 가입)
                </p>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => quickLogin("teacher")}
                disabled={loading}
                className="rounded-lg border border-amber-300 px-3 py-1 text-xs text-amber-800 hover:bg-amber-50 disabled:opacity-50"
              >
                교사 테스트 입장
              </button>
              <button
                type="button"
                onClick={() => quickLogin("student")}
                disabled={loading}
                className="rounded-lg border border-amber-300 px-3 py-1 text-xs text-amber-800 hover:bg-amber-50 disabled:opacity-50"
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
