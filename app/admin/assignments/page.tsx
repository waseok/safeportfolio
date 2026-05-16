"use client";

import { useState } from "react";
import { ASSIGNMENTS, type Assignment, SAFETY_SEVEN_CATEGORIES } from "@/lib/assignments-data";

const CATEGORY_COLORS: Record<string, string> = {
  교통안전: "bg-blue-100 text-blue-800 border-blue-300",
  화재안전: "bg-red-100 text-red-800 border-red-300",
  생활안전: "bg-green-100 text-green-800 border-green-300",
  응급처치: "bg-purple-100 text-purple-800 border-purple-300",
  사이버예방: "bg-indigo-100 text-indigo-800 border-indigo-300",
  재난안전: "bg-yellow-100 text-yellow-800 border-yellow-300",
  폭력예방: "bg-pink-100 text-pink-800 border-pink-300",
};

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>(ASSIGNMENTS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "생활안전" as (typeof SAFETY_SEVEN_CATEGORIES)[number],
    emoji: "📝",
    dueDate: "",
    points: 10,
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const newAssignment: Assignment = {
      id: `assign-${Date.now()}`,
      title: form.title,
      description: form.description,
      category: form.category,
      emoji: form.emoji,
      dueDate: form.dueDate,
      points: form.points,
      status: "active",
      submissionCount: 0,
      totalStudents: 24,
    };
    setAssignments((prev) => [newAssignment, ...prev]);
    setShowForm(false);
    setForm({
      title: "",
      description: "",
      category: "생활안전",
      emoji: "📝",
      dueDate: "",
      points: 10,
    });
  }

  function toggleStatus(id: string) {
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === "active" ? "closed" : "active" } : a
      )
    );
  }

  const activeCount = assignments.filter((a) => a.status === "active").length;
  const totalSubmissions = assignments.reduce((sum, a) => sum + (a.submissionCount ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div
        className="rounded-2xl p-5 text-white shadow-lg"
        style={{
          background: "linear-gradient(135deg, #0369a1 0%, #0284c7 55%, #0ea5e9 100%)",
        }}
      >
        <h1 className="text-2xl font-black">📝 함께 만드는 안전과제</h1>
        <p className="text-sky-100 text-sm mt-1 font-medium">
          학생들이 직접 실천하고 인증샷을 올리는 안전 과제를 만들어보세요.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/15 p-3 text-center border border-white/20">
            <p className="text-2xl font-black text-amber-200">{activeCount}</p>
            <p className="text-xs text-sky-100 mt-0.5">📋 진행중 과제</p>
          </div>
          <div className="rounded-xl bg-white/15 p-3 text-center border border-white/20">
            <p className="text-2xl font-black text-cyan-200">{totalSubmissions}</p>
            <p className="text-xs text-sky-100 mt-0.5">📸 총 제출 수</p>
          </div>
          <div className="rounded-xl bg-white/15 p-3 text-center border border-white/20">
            <p className="text-2xl font-black text-white">{assignments.length}</p>
            <p className="text-xs text-sky-100 mt-0.5">📚 전체 과제</p>
          </div>
        </div>
      </div>

      {/* 과제 만들기 버튼 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-800">과제 목록</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-xl px-4 py-2 text-sm font-bold text-white shadow-md transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #0284c7, #0ea5e9)" }}
        >
          {showForm ? "✕ 닫기" : "＋ 새 과제 만들기"}
        </button>
      </div>

      {/* 과제 만들기 폼 */}
      {showForm && (
        <div className="rounded-2xl border-2 border-sky-300 bg-sky-50 p-5 shadow-sm">
          <h3 className="text-base font-black text-sky-950 mb-4">📝 새 안전과제 만들기</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">과제 제목 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 등하교 교통안전 실천 인증"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-xl border border-sky-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">카테고리</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        category: e.target
                          .value as (typeof SAFETY_SEVEN_CATEGORIES)[number],
                      }))
                    }
                    className="w-full rounded-xl border border-sky-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none bg-white"
                  >
                    {SAFETY_SEVEN_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">이모지</label>
                  <input
                    type="text"
                    value={form.emoji}
                    onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
                    className="w-full rounded-xl border border-sky-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none bg-white text-center text-lg"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">과제 설명 *</label>
              <textarea
                required
                rows={3}
                placeholder="학생들이 무엇을 해야 하는지 구체적으로 설명해주세요."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-xl border border-sky-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none bg-white resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">마감일 *</label>
                <input
                  type="date"
                  required
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                  className="w-full rounded-xl border border-sky-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">지급 포인트</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={form.points}
                  onChange={(e) => setForm((f) => ({ ...f, points: parseInt(e.target.value) || 10 }))}
                  className="w-full rounded-xl border border-sky-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none bg-white"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="rounded-xl px-5 py-2 text-sm font-black text-white shadow transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #0284c7, #0ea5e9)" }}
              >
                과제 등록
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 과제 목록 */}
      <div className="space-y-3">
        {assignments.map((assignment) => {
          const sub = assignment.submissionCount ?? 0;
          const total = assignment.totalStudents ?? 24;
          const progressPct = total > 0 ? Math.round((sub / total) * 100) : 0;
          const isOverdue = new Date(assignment.dueDate) < new Date();
          const catColor = CATEGORY_COLORS[assignment.category] ?? "bg-gray-100 text-gray-800 border-gray-300";

          return (
            <div
              key={assignment.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                assignment.status === "closed" ? "opacity-60 border-slate-200" : "border-sky-200"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 text-3xl">{assignment.emoji}</div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-black text-slate-900">{assignment.title}</h3>
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${catColor}`}>
                        {assignment.category}
                      </span>
                      {assignment.status === "active" ? (
                        <span className="rounded-full bg-sky-100 border border-sky-300 text-sky-800 px-2 py-0.5 text-xs font-bold">
                          진행중
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 border border-gray-300 text-gray-500 px-2 py-0.5 text-xs font-bold">
                          마감됨
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{assignment.description}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>📅 마감: {assignment.dueDate} {isOverdue && assignment.status === "active" && <span className="text-red-500 font-bold">(기한 초과)</span>}</span>
                      <span>⭐ 포인트: {assignment.points}P</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => toggleStatus(assignment.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      assignment.status === "active"
                        ? "border border-slate-300 text-slate-600 hover:bg-slate-50"
                        : "border border-sky-400 text-sky-800 hover:bg-sky-50"
                    }`}
                  >
                    {assignment.status === "active" ? "마감하기" : "재개하기"}
                  </button>
                  <a
                    href="/admin"
                    className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                  >
                    📋 제출 확인
                  </a>
                </div>
              </div>

              {/* 제출 현황 바 */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>제출 현황</span>
                  <span className="font-semibold text-sky-800">
                    {assignment.submissionCount ?? 0}/{assignment.totalStudents ?? 24}명 ({progressPct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 안내 */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-bold mb-1">💡 과제 운영 안내</p>
        <ul className="space-y-1 text-xs list-disc list-inside text-blue-700">
          <li>학생이 과제 관련 인증샷을 올리면 <strong>인증 관리</strong> 메뉴에서 확인 후 승인/반려할 수 있어요.</li>
          <li>승인 시 과제에 설정한 포인트를 직접 지급하거나, <strong>학생 관리</strong>에서 개별 지급하세요.</li>
          <li>마감된 과제는 학생 화면에서 보이지 않아요.</li>
        </ul>
      </div>
    </div>
  );
}
