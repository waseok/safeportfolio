"use client";

import { useCallback, useEffect, useState } from "react";
import { type Assignment, SAFETY_SEVEN_CATEGORIES } from "@/lib/assignments-data";

const CATEGORY_COLORS: Record<string, string> = {
  생활안전: "bg-green-100 text-green-800 border-green-300",
  교통안전: "bg-blue-100 text-blue-800 border-blue-300",
  폭력예방: "bg-pink-100 text-pink-800 border-pink-300",
  중독예방: "bg-indigo-100 text-indigo-800 border-indigo-300",
  재난안전: "bg-yellow-100 text-yellow-800 border-yellow-300",
  직업안전: "bg-orange-100 text-orange-800 border-orange-300",
  응급처치: "bg-purple-100 text-purple-800 border-purple-300",
};

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "생활안전" as (typeof SAFETY_SEVEN_CATEGORIES)[number],
  emoji: "📝",
  dueDate: "",
  points: 10,
};

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch("/api/admin/assignments");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "과제 목록을 불러오지 못했습니다.");
      setAssignments(data.assignments ?? []);
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "목록 로드 실패");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(assignment: Assignment) {
    setEditingId(assignment.id);
    setForm({
      title: assignment.title,
      description: assignment.description,
      category: assignment.category,
      emoji: assignment.emoji,
      dueDate: assignment.dueDate,
      points: assignment.points,
    });
    setShowForm(true);
    setApiError(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setApiError(null);
    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      emoji: form.emoji,
      dueDate: form.dueDate,
      points: form.points,
    };

    try {
      const url = editingId
        ? `/api/admin/assignments/${encodeURIComponent(editingId)}`
        : "/api/admin/assignments";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "저장에 실패했습니다.");
      await loadAssignments();
      resetForm();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "저장 중 오류");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(assignment: Assignment) {
    const next = assignment.status === "active" ? "closed" : "active";
    setApiError(null);
    try {
      const res = await fetch(`/api/admin/assignments/${encodeURIComponent(assignment.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "상태 변경 실패");
      await loadAssignments();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "상태 변경 중 오류");
    }
  }

  const activeCount = assignments.filter((a) => a.status === "active").length;
  const totalSubmissions = assignments.reduce((sum, a) => sum + (a.submissionCount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl p-5 text-white shadow-lg"
        style={{
          background: "linear-gradient(135deg, #0369a1 0%, #0284c7 55%, #0ea5e9 100%)",
        }}
      >
        <h1 className="text-[1.75rem] font-black">📝 함께 만드는 안전과제</h1>
        <p className="text-sky-100 text-base mt-1 font-semibold leading-relaxed">
          학생들이 직접 실천하고 인증샷을 올리는 안전 과제를 만들고 수정할 수 있어요.
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

      {apiError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">
          ⚠️ {apiError}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-800">과제 목록</h2>
        <button
          type="button"
          onClick={() => (showForm && !editingId ? resetForm() : openCreate())}
          className="rounded-xl px-4 py-2 text-sm font-bold text-white shadow-md transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #0284c7, #0ea5e9)" }}
        >
          {showForm && !editingId ? "✕ 닫기" : "＋ 새 과제 만들기"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border-2 border-sky-300 bg-sky-50 p-5 shadow-sm">
          <h3 className="text-base font-black text-sky-950 mb-4">
            {editingId ? "✏️ 안전과제 수정" : "📝 새 안전과제 만들기"}
          </h3>
          <form onSubmit={handleSave} className="space-y-3">
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
                        category: e.target.value as (typeof SAFETY_SEVEN_CATEGORIES)[number],
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
                    maxLength={4}
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
                  onChange={(e) =>
                    setForm((f) => ({ ...f, points: parseInt(e.target.value, 10) || 10 }))
                  }
                  className="w-full rounded-xl border border-sky-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none bg-white"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl px-5 py-2 text-sm font-black text-white shadow transition hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #0284c7, #0ea5e9)" }}
              >
                {saving ? "저장 중…" : editingId ? "수정 저장" : "과제 등록"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-center text-slate-500 py-10 font-medium">과제 목록 불러오는 중…</p>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => {
            const sub = assignment.submissionCount ?? 0;
            const total = assignment.totalStudents ?? 24;
            const progressPct = total > 0 ? Math.round((sub / total) * 100) : 0;
            const isOverdue = new Date(assignment.dueDate) < new Date();
            const catColor =
              CATEGORY_COLORS[assignment.category] ?? "bg-gray-100 text-gray-800 border-gray-300";

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
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${catColor}`}
                        >
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
                        <span>
                          📅 마감: {assignment.dueDate}{" "}
                          {isOverdue && assignment.status === "active" && (
                            <span className="text-red-500 font-bold">(기한 초과)</span>
                          )}
                        </span>
                        <span>⭐ 포인트: {assignment.points}P</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(assignment)}
                      className="rounded-lg border border-amber-400 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition"
                    >
                      ✏️ 수정
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleStatus(assignment)}
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

                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>제출 현황</span>
                    <span className="font-semibold text-sky-800">
                      {sub}/{total}명 ({progressPct}%)
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
      )}

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-bold mb-1">💡 과제 운영 안내</p>
        <ul className="space-y-1 text-xs list-disc list-inside text-blue-700">
          <li>
            <strong>수정</strong>한 내용은 학생 「안전 과제 확인하기」「올리기」 화면에 바로 반영돼요.
          </li>
          <li>
            DB 연동: Supabase에서 <code className="text-[11px]">supabase/safety-assignments.sql</code>을
            한 번 실행해 주세요.
          </li>
          <li>마감된 과제는 학생 화면에서 보이지 않아요.</li>
        </ul>
      </div>
    </div>
  );
}
