"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

    // 학급 내 기존 학생 수로 번호 부여 (이름: 학생 1, 학생 2, ...)
    const { count } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("class_id", klass.id)
      .eq("role", "student");
    const studentNum = (count ?? 0) + 1;

    const email = `student-${klass.id}-${Date.now()}@safe.local`;
    const password = "123456";

    let authUserId: string | null = null;
    const signUpResult = await supabase.auth.signUp({ email, password });
    if (signUpResult.error && signUpResult.error.message.includes("already been registered")) {
      setError("이미 입장한 기기입니다. 로그인 페이지에서 다시 시도해주세요.");
      setLoading(false);
      return;
    }
    if (signUpResult.error || !signUpResult.data.user) {
      setError(signUpResult.error?.message ?? "학생 입장에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setLoading(false);
      return;
    }
    authUserId = signUpResult.data.user.id;

    const { error: profileError } = await supabase.from("users").upsert(
      {
        id: authUserId,
        role: "student",
        name: displayName,
        grade: klass.grade,
        class_number: klass.class_number,
        student_number: studentNum,
        class_id: klass.id,
        current_points: 25,
        total_points: 25,
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
    <div className="flex min-h-screen flex-col items-center justify-center p-6"
      style={{background: "linear-gradient(180deg, #B8E4F9 0%, #C8E6F5 50%, #D4EDFF 100%)"}}>
      <div className="mb-6 text-center">
        <div className="text-5xl mb-2">🏫</div>
        <h1 className="text-3xl font-black text-white drop-shadow-md">학생 입장</h1>
      </div>
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl border-2 border-white">
        <p className="mb-6 text-center text-sm text-sky-700 font-bold bg-sky-50 rounded-2xl p-3">
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
            className="rounded-full border-2 border-sky-200 px-4 py-3 text-center text-xl tracking-[0.5em] focus:border-sky-400 focus:outline-none bg-sky-50/50 font-black"
            required
          />
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-full border-2 border-sky-200 px-4 py-3 text-center focus:border-sky-400 focus:outline-none bg-sky-50/50 font-bold"
            required
          />
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 font-medium" role="alert">
              ⚠️ {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full py-3 font-black text-gray-900 shadow-lg hover:opacity-90 disabled:opacity-50 transition"
            style={{background: "linear-gradient(135deg, #FFD700, #FFC107)"}}
          >
            {loading ? "입장 중…" : "🚀 학급으로 입장하기!"}
          </button>
        </form>
      </div>
    </div>
  );
}
