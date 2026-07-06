"use client";

import { createClient } from "@/lib/supabase/client";
import { clearReviewDemoCookie, type ReviewRole } from "@/lib/review-demo";

export function ReviewModeBanner({ role }: { role: ReviewRole }) {
  const label = role === "student" ? "학생 화면" : "교사 화면";

  async function handleExit() {
    clearReviewDemoCookie();
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/review";
  }

  return (
    <div
      className="sticky top-0 z-50 border-b border-amber-300 bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 px-3 py-2 shadow-md"
      role="status"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-amber-950">
          <span className="mr-1">🔍</span>
          심사용 테스트 모드 · <span className="text-amber-800">{label}</span>
          <span className="ml-2 hidden font-medium text-amber-900/80 sm:inline">
            로그인 없이 원클릭으로 체험 중입니다. 실제 학생·교사 데이터와 분리된 데모 계정입니다.
          </span>
        </p>
        <button
          type="button"
          onClick={handleExit}
          className="shrink-0 rounded-lg border border-amber-400 bg-white px-3 py-1 text-xs font-extrabold text-amber-900 shadow-sm hover:bg-amber-50 transition"
        >
          테스트 종료
        </button>
      </div>
    </div>
  );
}
