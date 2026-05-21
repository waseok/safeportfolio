"use client";

import { useState } from "react";

/** 학생·학부모가 안전 과제 아이디어를 제안할 때 (로컬에만 간단 저장되는 데모) */
export function AssignmentSuggestionForm({
  variant = "card",
}: {
  variant?: "card" | "compact";
}) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      const key = "safe_assignment_suggestions";
      const prev = typeof window !== "undefined" ? localStorage.getItem(key) : null;
      const list = prev ? (JSON.parse(prev) as string[]) : [];
      list.push(`[${new Date().toISOString()}] ${trimmed}`);
      localStorage.setItem(key, JSON.stringify(list.slice(-20)));
    } catch {
      /* ignore */
    }
    setSent(true);
    setText("");
    setTimeout(() => setSent(false), 4000);
  }

  const box =
    variant === "card"
      ? "rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-5 shadow-sm"
      : "rounded-2xl border border-sky-200 bg-white/90 p-4 shadow-sm";

  return (
    <form onSubmit={handleSubmit} className={box}>
      <h3 className="text-base font-extrabold text-sky-900">
        💡 다음에 다루면 좋을 안전 과제를 제안해 주세요
      </h3>
      <p className="mt-1 text-sm font-medium text-sky-800/90">
        선생님이 참고할 수 있어요. (이 기기 브라우저에만 잠깐 저장됩니다)
      </p>
      <label htmlFor="assignment-suggestion" className="sr-only">
        과제 제안 내용
      </label>
      <textarea
        id="assignment-suggestion"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={variant === "compact" ? 3 : 4}
        placeholder="예: 가정 내 화재 대피 역할극, 스쿨존 주변 불법 주정차 신고 체험…"
        className="mt-3 w-full rounded-xl border border-sky-200 bg-white px-3 py-2.5 text-base font-medium text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={!text.trim()}
          className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-extrabold text-white shadow transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          제안 보내기
        </button>
        {sent && (
          <span className="text-sm font-bold text-emerald-700" role="status">
            ✓ 제안을 남겼어요. 고마워요!
          </span>
        )}
      </div>
    </form>
  );
}
