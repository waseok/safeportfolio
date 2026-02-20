"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

/** 아이디 → 내부 이메일 (영문·숫자만, Supabase용) */
function toTeacherEmail(id: string): string {
  const safe = id.trim().toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 30) || "user";
  return `teacher-${safe}@safe.local`;
}

// 교사 전용 회원가입: 아이디 + 비밀번호 6자리 + 이름(선택)
export default function SignupPage() {
  const [userId, setUserId] = useState("");
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

    const id = userId.trim();
    const pw = password.replace(/\D/g, "").slice(0, 6);
    if (!id) {
      setError("아이디를 입력해 주세요.");
      setLoading(false);
      return;
    }
    if (pw.length !== 4) {
      setError("비밀번호는 숫자 6자리로 입력해 주세요.");
      setLoading(false);
      return;
    }

    const email = toTeacherEmail(id);

    try {
      const { data: authData, error: signError } = await supabase.auth.signUp({
        email,
        password: pw,
      });
      if (signError) {
        setError(signError.message);
        return;
      }

      if (!authData.user?.id) {
        setError("이메일 인증이 켜져 있을 수 있습니다. Supabase에서 Confirm email을 끄고 다시 시도하세요.");
        return;
      }

      const accessToken = authData.session?.access_token;
      if (!accessToken) {
        setError("세션을 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch("/api/signup/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || id,
          accessToken,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const raw = data.error || "프로필 저장에 실패했습니다.";
        if (typeof raw === "string" && (raw.includes("schema cache") || raw.includes("public.users"))) {
          setError("Supabase에 users 테이블이 없습니다. SQL Editor에서 schema.sql을 실행한 뒤 다시 시도하세요.");
        } else {
          setError(raw);
        }
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("요청 시간이 초과되었습니다. 다시 시도해 주세요.");
      } else {
        setError(err instanceof Error ? err.message : "회원가입 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-amber-50/80 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-amber-200 bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-bold text-amber-900">
          교사 회원가입
        </h1>
        <p className="mb-6 text-center text-sm text-amber-800/80">
          아이디와 비밀번호(숫자 6자리)만 입력하세요. 가입 후 학급코드(4자리)를 만들 수 있습니다.
        </p>
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
          <input
            type="text"
            placeholder="이름 (선택)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-amber-200 px-4 py-2 focus:border-amber-500 focus:outline-none"
          />
          {error && (
            <div role="alert" className="rounded-lg border-2 border-red-300 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
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
