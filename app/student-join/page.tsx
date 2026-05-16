"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function nameHash(name: string): string {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = (h + (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

function explainDbError(message: string): string {
  if (message.includes("infinite recursion") || message.includes("policy for relation \"users\"")) {
    return "DB 정책(RLS) 충돌입니다. Supabase SQL Editor에서 최신 schema.sql을 다시 실행해 주세요.";
  }
  return message;
}

export default function StudentJoinPage() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    const classCode = code.trim().replace(/\D/g, "").slice(0, 4);
    const displayName = name.trim();
    if (classCode.length !== 4) {
      setError("학급코드는 4자리 숫자로 입력해주세요.");
      setLoading(false);
      return;
    }
    if (!displayName) {
      setError("이름을 입력해주세요.");
      setLoading(false);
      return;
    }

    const { data: klass, error: classError } = await supabase
      .from("classes")
      .select("id, grade, class_number")
      .eq("code", classCode)
      .maybeSingle();

    if (classError || !klass) {
      setError("해당 학급코드를 찾을 수 없습니다. 선생님께 코드를 확인해주세요.");
      setLoading(false);
      return;
    }

    // 학급+이름 조합으로 결정론적 이메일 생성 → 같은 이름이면 항상 같은 계정
    const email = `s-${klass.id.slice(0, 8)}-${nameHash(displayName)}@safe.local`;
    const password = "safe123456";

    let authUserId: string | null = null;

    // 1) 신규 가입 시도
    const signUpResult = await supabase.auth.signUp({ email, password });

    if (signUpResult.error) {
      if (
        signUpResult.error.message.includes("already registered") ||
        signUpResult.error.message.includes("already been registered") ||
        signUpResult.error.status === 422
      ) {
        // 2) 이미 존재하는 계정 → 로그인
        const signInResult = await supabase.auth.signInWithPassword({ email, password });
        if (signInResult.error || !signInResult.data.user) {
          setError("이미 입장한 계정입니다. 로그인에 실패했습니다. 선생님께 문의해 주세요.");
          setLoading(false);
          return;
        }
        authUserId = signInResult.data.user.id;
      } else {
        setError(signUpResult.error.message);
        setLoading(false);
        return;
      }
    } else {
      authUserId = signUpResult.data.user?.id ?? null;
    }

    if (!authUserId) {
      setError("입장에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setLoading(false);
      return;
    }

    const { data: existing } = await supabase
      .from("users")
      .select("student_number, class_id")
      .eq("id", authUserId)
      .maybeSingle();

    let studentNum: number;
    if (
      existing?.student_number != null &&
      existing.class_id === klass.id
    ) {
      studentNum = existing.student_number;
    } else {
      const { data: maxRows } = await supabase
        .from("users")
        .select("student_number")
        .eq("class_id", klass.id)
        .eq("role", "student")
        .not("student_number", "is", null)
        .order("student_number", { ascending: false })
        .limit(1);
      const maxN = maxRows?.[0]?.student_number ?? 0;
      studentNum = maxN + 1;
    }

    const { error: profileError } = await supabase.from("users").upsert(
      {
        id: authUserId,
        role: "student",
        name: displayName,
        grade: klass.grade,
        class_number: klass.class_number,
        student_number: studentNum,
        class_id: klass.id,
      },
      { onConflict: "id" }
    );

    if (profileError) {
      setError(`학생 정보 저장 중 오류: ${explainDbError(profileError.message)}`);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      <div
        aria-hidden
        className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/images/site-bg-illustration.png)" }}
      />
      <div aria-hidden className="fixed inset-0 -z-10 bg-white/78 backdrop-blur-[1px]" />

      <div className="relative z-10 mb-6 text-center">
        <div className="mb-2 text-5xl">🏫</div>
        <h1 className="text-3xl font-black text-slate-800 drop-shadow-sm">학생 입장</h1>
      </div>
      <div className="relative z-10 w-full max-w-md rounded-3xl border-2 border-white bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
        <p className="mb-6 rounded-2xl bg-sky-50 p-3 text-center text-base font-bold text-sky-700">
          선생님이 알려준 <strong>학급코드 4자리</strong>와<br />내 <strong>이름</strong>을 입력하세요
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            placeholder="학급코드 (4자리)"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="rounded-full border-2 border-sky-200 bg-sky-50/50 px-4 py-3 text-center text-xl font-black tracking-[0.5em] focus:border-sky-400 focus:outline-none"
            required
          />
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-full border-2 border-sky-200 bg-sky-50/50 px-4 py-3 text-center font-bold focus:border-sky-400 focus:outline-none"
            required
          />
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">
              ⚠️ {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full py-3 font-black text-gray-900 shadow-lg transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #FFD700, #FFC107)" }}
          >
            {loading ? "입장 중…" : "🚀 학급으로 입장하기!"}
          </button>
        </form>
      </div>
    </div>
  );
}
