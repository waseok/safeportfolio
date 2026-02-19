"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type ClassRow = {
  id: string;
  grade: number | null;
  class_number: number | null;
  name: string | null;
  code: string;
};

type StudentRow = {
  id: string;
  name: string;
  student_number: number | null;
  current_points: number;
  total_points: number;
};

export function AdminStudentsClient({
  classes,
}: {
  classes: ClassRow[];
}) {
  const router = useRouter();
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [awardTarget, setAwardTarget] = useState<StudentRow | null>(null);
  const [awardPoints, setAwardPoints] = useState(5);
  const [awardLoading, setAwardLoading] = useState(false);
  const [awardError, setAwardError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      return;
    }
    setListError(null);
    setLoading(true);
    fetch(`/api/admin/classes/${selectedClassId}/students`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStudents(data.students ?? []);
      })
      .catch((e) => {
        setListError(e instanceof Error ? e.message : "학생 목록을 불러올 수 없습니다.");
        setStudents([]);
      })
      .finally(() => setLoading(false));
  }, [selectedClassId]);

  async function handleAwardSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!awardTarget) return;
    const num = Math.min(100, Math.max(1, awardPoints));
    setAwardError(null);
    setAwardLoading(true);
    try {
      const res = await fetch("/api/admin/award-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: awardTarget.id, points: num }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "포인트 지급 실패");
      setStudents((prev) =>
        prev.map((s) =>
          s.id === awardTarget.id
            ? {
                ...s,
                current_points: data.newCurrentPoints,
                total_points: data.newTotalPoints,
              }
            : s
        )
      );
      setAwardTarget(null);
      setAwardPoints(5);
      router.refresh();
    } catch (e) {
      setAwardError(e instanceof Error ? e.message : "포인트 지급 중 오류");
    } finally {
      setAwardLoading(false);
    }
  }

  const classLabel = (c: ClassRow) =>
    c.name ?? `${c.grade ?? "-"}학년 ${c.class_number ?? "-"}반`;

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          학급 선택
        </label>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
        >
          <option value="">학급을 선택하세요</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {classLabel(c)} (코드: {c.code})
            </option>
          ))}
        </select>
        {classes.length === 0 && (
          <p className="mt-2 text-sm text-slate-600">
            학급이 없습니다. 학급 코드 관리에서 먼저 학급을 만드세요.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">학생 목록</h2>
        {!selectedClassId ? (
          <p className="text-slate-600">위에서 학급을 선택하세요.</p>
        ) : loading ? (
          <p className="text-slate-600">불러오는 중…</p>
        ) : listError ? (
          <p className="text-red-600" role="alert">
            {listError}
          </p>
        ) : students.length === 0 ? (
          <p className="text-slate-600">이 학급에 등록된 학생이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-3 font-medium text-slate-700">번호</th>
                  <th className="p-3 font-medium text-slate-700">이름</th>
                  <th className="p-3 font-medium text-slate-700">보유 포인트</th>
                  <th className="p-3 font-medium text-slate-700">누적 포인트</th>
                  <th className="p-3 font-medium text-slate-700">포인트 지급</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100">
                    <td className="p-3 text-slate-700">{s.student_number ?? "-"}</td>
                    <td className="p-3 font-medium text-slate-900">{s.name}</td>
                    <td className="p-3 text-amber-600 font-medium">{s.current_points} P</td>
                    <td className="p-3 text-slate-600">{s.total_points} P</td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => {
                          setAwardTarget(s);
                          setAwardPoints(5);
                          setAwardError(null);
                        }}
                        className="rounded border border-amber-400 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100"
                      >
                        포인트 지급
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {awardTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="award-modal-title"
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="award-modal-title" className="text-lg font-bold text-slate-800">
              포인트 지급
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              <strong>{awardTarget.name}</strong>님에게 지급할 포인트를 입력하세요.
            </p>
            <form onSubmit={handleAwardSubmit} className="mt-4 space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                포인트 (1~100)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={awardPoints}
                onChange={(e) => setAwardPoints(parseInt(e.target.value, 10) || 1)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
              {awardError && (
                <p className="text-sm text-red-600" role="alert">
                  {awardError}
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={awardLoading}
                  className="flex-1 rounded-lg bg-amber-500 py-2 font-medium text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  {awardLoading ? "지급 중…" : "지급"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAwardTarget(null);
                    setAwardError(null);
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
