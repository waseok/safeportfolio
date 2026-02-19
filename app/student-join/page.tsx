"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function StudentJoinPage() {
  const [code, setCode] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    const classCode = code.trim();
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
      setError("해당 학급코드를 찾을 수 없습니다.");
      setLoading(false);
      return;
    }

    const num = parseInt(studentNumber, 10);
    if (!num || num <= 0) {
      setError("번호를 올바르게 입력해주세요.");
      setLoading(false);
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("이름을 입력해주세요.");
      setLoading(false);
      return;
    }

    // 학생용 내부용 이메일/비밀번호 자동 생성 (학생은 입력하지 않음)
    const email = `student-${klass.id}-${num}@safe.local`;
    const password = `SAFE-${classCode}-${num}`;

    // 기존 계정 여부에 따라 로그인 또는 회원가입
    let authUserId: string | null = null;
    const signInResult = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!signInResult.error && signInResult.data.user) {
      authUserId = signInResult.data.user.id;
    } else {
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
        });
      if (signUpError || !signUpData.user) {
        setError("학생 계정을 만들 수 없습니다. 잠시 후 다시 시도해주세요.");
        setLoading(false);
        return;
      }
      authUserId = signUpData.user.id;
    }

    if (!authUserId) {
      setError("로그인에 실패했습니다.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("users").upsert(
      {
        id: authUserId,
        role: "student",
        name: trimmedName,
        grade: klass.grade,
        class_number: klass.class_number,
        student_number: num,
        class_id: klass.id,
      },
      { onConflict: "id" }
    );

    if (profileError) {
      setError("학생 정보를 저장하는 중 오류가 발생했습니다.");
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
          선생님이 알려준 <strong>학급코드 4자리</strong>와
          <br />
          본인 <strong>이름 · 번호</strong>만 입력하면 됩니다.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            placeholder="학급코드 (4자리)"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
            className="rounded-lg border border-amber-200 px-4 py-2 text-center text-lg tracking-[0.4em] focus:border-amber-500 focus:outline-none"
            required
          />
          <input
            type="number"
            placeholder="번호"
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
            className="rounded-lg border border-amber-200 px-4 py-2 focus:border-amber-500 focus:outline-none"
            min={1}
            required
          />
          <input
            type="text"
            placeholder="이름"
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
            {loading ? "입장 중…" : "학급으로 입장하기"}
          </button>
        </form>
      </div>
    </div>
  );
}

