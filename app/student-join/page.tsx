"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function StudentJoinPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    const classCode = code.trim().replace(/\D/g, "").slice(0, 4);
    if (classCode.length !== 4) {
      setError("학급코드는 4자리 숫자로 입력해주세요.");
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
    const displayName = `학생 ${studentNum}`;

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
      },
      { onConflict: "id" }
    );

    if (profileError) {
      setError("학생 정보 저장 중 오류가 발생했습니다.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-amber-50/80 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-amber-200 bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-bold text-amber-900">
          학생 입장
        </h1>
        <p className="mb-6 text-center text-sm text-amber-800/80">
          선생님이 알려준 <strong>학급코드 4자리</strong>만 입력하세요.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            placeholder="학급코드 (4자리)"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="rounded-lg border border-amber-200 px-4 py-2 text-center text-lg tracking-[0.4em] focus:border-amber-500 focus:outline-none"
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
            {loading ? "입장 중…" : "학급으로 입장하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
