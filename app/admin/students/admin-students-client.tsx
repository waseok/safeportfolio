"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SAFETY_SEVEN_CATEGORIES } from "@/lib/assignments-data";

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

const ASSIGN_SHORT = ["생활", "교통", "폭력", "중독", "재난", "직업", "응급"] as const;

function isAssignmentDoneMock(studentId: string, topicIndex: number): boolean {
  let h = 0;
  for (let i = 0; i < studentId.length; i += 1) {
    h = (h * 31 + studentId.charCodeAt(i)) >>> 0;
  }
  return ((h >> topicIndex) & 1) === 1;
}

const MOCK_STUDENTS: StudentRow[] = [
  { id: "mock-2",  name: "김민준", student_number: 2,  current_points: 120, total_points: 185 },
  { id: "mock-3",  name: "박서연", student_number: 3,  current_points: 30, total_points: 62 },
  { id: "mock-4",  name: "이지훈", student_number: 4,  current_points: 0,  total_points: 10 },
  { id: "mock-5",  name: "최수아", student_number: 5,  current_points: 80, total_points: 130 },
  { id: "mock-6",  name: "정민서", student_number: 6,  current_points: 55, total_points: 95 },
  { id: "mock-7",  name: "강하준", student_number: 7,  current_points: 150, total_points: 210 },
  { id: "mock-8",  name: "윤서현", student_number: 8,  current_points: 10, total_points: 30 },
  { id: "mock-9",  name: "임지우", student_number: 9,  current_points: 65, total_points: 110 },
  { id: "mock-10", name: "한예린", student_number: 10, current_points: 90, total_points: 145 },
  { id: "mock-11", name: "오준혁", student_number: 11, current_points: 5,  total_points: 15 },
  { id: "mock-12", name: "서지아", student_number: 12, current_points: 40, total_points: 70 },
  { id: "mock-13", name: "조현우", student_number: 13, current_points: 0,  total_points: 0  },
  { id: "mock-14", name: "신유진", student_number: 14, current_points: 100, total_points: 165 },
  { id: "mock-15", name: "류지성", student_number: 15, current_points: 75, total_points: 120 },
  { id: "mock-16", name: "문채원", student_number: 16, current_points: 20, total_points: 45 },
  { id: "mock-17", name: "황도현", student_number: 17, current_points: 135, total_points: 200 },
  { id: "mock-18", name: "배수빈", student_number: 18, current_points: 60, total_points: 105 },
  { id: "mock-19", name: "전민혁", student_number: 19, current_points: 0,  total_points: 20 },
  { id: "mock-20", name: "노예나", student_number: 20, current_points: 85, total_points: 140 },
  { id: "mock-21", name: "고지안", student_number: 21, current_points: 15, total_points: 35 },
  { id: "mock-22", name: "석지우", student_number: 22, current_points: 50, total_points: 88 },
  { id: "mock-23", name: "표현서", student_number: 23, current_points: 110, total_points: 170 },
  { id: "mock-24", name: "마은빈", student_number: 24, current_points: 25, total_points: 50 },
];

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
        const fetched = data.students ?? [];
        setStudents(fetched.length > 0 ? fetched : MOCK_STUDENTS);
      })
      .catch(() => {
        setStudents(MOCK_STUDENTS);
      })
      .finally(() => setLoading(false));
  }, [selectedClassId]);

  async function handleAwardSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!awardTarget) return;
    const num = Math.min(100, Math.max(1, awardPoints));
    setAwardError(null);
    setAwardLoading(true);

    // 모의 데이터 학생인 경우 즉시 로컬 업데이트
    if (awardTarget.id.startsWith("mock-")) {
      await new Promise((r) => setTimeout(r, 600));
      setStudents((prev) =>
        prev.map((s) =>
          s.id === awardTarget.id
            ? { ...s, current_points: s.current_points + num, total_points: s.total_points + num }
            : s
        )
      );
      setAwardTarget(null);
      setAwardPoints(5);
      setAwardLoading(false);
      return;
    }

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
                  <th className="p-2 font-medium text-slate-700 whitespace-nowrap">순번</th>
                  <th className="p-2 font-medium text-slate-700 whitespace-nowrap">이름</th>
                  {ASSIGN_SHORT.map((label, i) => (
                    <th
                      key={label}
                      className="p-2 text-center text-xs font-semibold text-slate-700 min-w-[2.5rem]"
                      title={SAFETY_SEVEN_CATEGORIES[i]}
                    >
                      {label}
                    </th>
                  ))}
                  <th className="p-2 font-medium text-slate-700 whitespace-nowrap">보유</th>
                  <th className="p-2 font-medium text-slate-700 whitespace-nowrap">누적</th>
                  <th className="p-2 font-medium text-slate-700 whitespace-nowrap">지급</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, rowIdx) => (
                  <tr key={s.id} className="border-b border-slate-100">
                    <td className="p-2 text-slate-700 font-medium">{rowIdx + 1}</td>
                    <td className="p-2 font-semibold text-slate-900">{s.name}</td>
                    {ASSIGN_SHORT.map((_, i) => (
                      <td key={i} className="p-2 text-center text-sm">
                        <span
                          className={
                            isAssignmentDoneMock(s.id, i)
                              ? "inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold"
                              : "text-slate-300"
                          }
                          title={SAFETY_SEVEN_CATEGORIES[i]}
                        >
                          {isAssignmentDoneMock(s.id, i) ? "✓" : "·"}
                        </span>
                      </td>
                    ))}
                    <td className="p-2 text-amber-600 font-semibold whitespace-nowrap">
                      {s.current_points} P
                    </td>
                    <td className="p-2 text-slate-600 whitespace-nowrap">{s.total_points} P</td>
                    <td className="p-2 whitespace-nowrap">
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
