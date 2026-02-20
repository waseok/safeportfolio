"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ClassRow = {
  id: string;
  grade: number | null;
  class_number: number | null;
  code: string;
  name: string | null;
};

export function ClassesListClient({ initialClasses }: { initialClasses: ClassRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initialClasses);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nextCode, setNextCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveCode(classId: string) {
    const code = nextCode.replace(/\D/g, "").slice(0, 4);
    if (code.length !== 4) {
      setError("학급코드는 숫자 4자리로 입력해주세요.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "학급코드 수정 실패");
      setRows((prev) => prev.map((r) => (r.id === classId ? { ...r, code } : r)));
      setEditingId(null);
      setNextCode("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-800">내 학급 목록</h2>
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {!rows.length ? (
        <p className="text-slate-600">아직 생성한 학급이 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {c.name ?? `${c.grade ?? "-"}학년 ${c.class_number ?? "-"}반`}
                  </p>
                  <p className="text-sm text-slate-700">
                    학급코드{" "}
                    <span className="font-mono text-lg text-slate-900">{c.code}</span>
                  </p>
                </div>
                {editingId === c.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      value={nextCode}
                      onChange={(e) => setNextCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-center text-base tracking-[0.25em] focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => saveCode(c.id)}
                      className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setNextCode("");
                      }}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(c.id);
                      setNextCode(c.code);
                    }}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    코드 수정
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

