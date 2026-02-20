"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

// 교사 전용 회원가입 페이지
export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    try {
      const { data: authData, error: signError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signError) {
        setError(signError.message);
        return;
      }

      if (!authData.user?.id) {
        setError(
          "Supabase에서 이메일 인증이 켜져 있습니다. 대시보드 → Authentication → Providers → Email에서 'Confirm email'을 끄고 다시 가입해 주세요."
        );
        return;
      }

      const accessToken = authData.session?.access_token;
      if (!accessToken) {
        setError("세션을 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }

      // 서버 API로 프로필 등록 (타임아웃 15초 → 무한 대기 방지)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch("/api/signup/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          accessToken,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const raw = data.error || "프로필 저장에 실패했습니다.";
        if (
          typeof raw === "string" &&
          (raw.includes("schema cache") || raw.includes("public.users"))
        ) {
          setError(
            "Supabase에 users 테이블이 없습니다. Supabase 대시보드 → SQL Editor에서 프로젝트의 supabase/schema.sql 내용 전체를 붙여넣고 Run 실행한 뒤 다시 시도하세요."
          );
        } else {
          setError(raw);
        }
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("요청 시간이 초과되었습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.");
      } else {
        setError(
          "회원가입 처리 중 알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-amber-50/80 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-amber-200 bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-bold text-amber-900">
          교사용 회원가입
        </h1>
        <p className="mb-6 text-center text-sm text-amber-800/80">
          선생님이 먼저 계정을 만들고, 학급 코드를 발급한 뒤
          <br />
          학생들에게 코드를 나눠주세요.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="교사 이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-amber-200 px-4 py-2 focus:border-amber-500 focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="비밀번호 (4자 이상, 숫자 가능)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-amber-200 px-4 py-2 focus:border-amber-500 focus:outline-none"
            required
            minLength={4}
          />
          <input
            type="text"
            placeholder="선생님 성함"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            {loading ? "가입 중…" : "교사 계정 만들기"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-amber-800/80">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-medium text-amber-600 underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
