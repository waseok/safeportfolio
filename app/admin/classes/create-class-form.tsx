"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateClassForm() {
  const [grade, setGrade] = useState("");
  const [classNumber, setClassNumber] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: grade ? parseInt(grade, 10) : null,
          classNumber: classNumber ? parseInt(classNumber, 10) : null,
          name: name.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "학급 생성에 실패했습니다.");
      }
      setGrade("");
      setClassNumber("");
      setName("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "학급 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <h2 className="mb-3 text-sm font-semibold text-slate-800">
        새 학급 만들기
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          type="number"
          min={1}
          max={6}
          placeholder="학년"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
        />
        <input
          type="number"
          min={1}
          placeholder="반"
          value={classNumber}
          onChange={(e) => setClassNumber(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
        />
        <input
          type="text"
          placeholder="학급 이름 (선택)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none sm:col-span-1"
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="mt-3 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-50"
      >
        {loading ? "생성 중…" : "학급 코드 생성"}
      </button>
    </form>
  );
}

