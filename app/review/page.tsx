"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { enterReviewDemo, type ReviewRole } from "@/lib/review-demo";

const ENTRY_CARDS: {
  role: ReviewRole;
  emoji: string;
  title: string;
  desc: string;
  features: string[];
  border: string;
  bg: string;
}[] = [
  {
    role: "student",
    emoji: "🎒",
    title: "학생 화면 체험",
    desc: "학생이 보는 메뉴와 기능을 바로 둘러볼 수 있어요.",
    features: ["홈 · 갤러리", "안전 과제 확인·올리기", "상점 · 내 정보"],
    border: "border-sky-300",
    bg: "from-sky-50 to-blue-50",
  },
  {
    role: "teacher",
    emoji: "👩‍🏫",
    title: "교사 화면 체험",
    desc: "교사용 관리 메뉴를 로그인 없이 원클릭으로 입장합니다.",
    features: ["과제 인증 관리", "안전 과제·상점 관리", "학생·학급 관리"],
    border: "border-indigo-300",
    bg: "from-indigo-50 to-slate-50",
  },
];

export default function ReviewEntryPage() {
  const [loading, setLoading] = useState<ReviewRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleEnter(role: ReviewRole) {
    setError(null);
    setLoading(role);
    const supabase = createClient();
    try {
      const result = await enterReviewDemo(supabase, role);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(result.redirectPath);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "입장 중 오류가 발생했습니다.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      <div
        aria-hidden
        className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/images/site-bg-illustration.png)" }}
      />
      <div aria-hidden className="fixed inset-0 -z-10 bg-white/85 backdrop-blur-[2px]" />

      <div className="relative z-10 mb-8 flex max-w-lg flex-col items-center text-center">
        <Image src="/logo.png" alt="SAFE 로고" width={200} height={200} className="mb-4" priority />
        <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-sm font-extrabold text-amber-900">
          🔍 심사용 테스트 입장
        </span>
        <h1 className="text-2xl font-extrabold text-slate-800">SAFE 포트폴리오 체험하기</h1>
        <p className="mt-3 text-base font-medium leading-relaxed text-slate-600">
          아이디·비밀번호 입력 없이 <strong className="text-slate-800">원클릭</strong>으로 학생·교사
          화면을 둘러볼 수 있습니다.
        </p>
      </div>

      <div className="relative z-10 grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        {ENTRY_CARDS.map((card) => (
          <button
            key={card.role}
            type="button"
            disabled={loading !== null}
            onClick={() => handleEnter(card.role)}
            className={`rounded-2xl border-2 ${card.border} bg-gradient-to-br ${card.bg} p-6 text-left shadow-lg transition hover:scale-[1.02] hover:shadow-xl disabled:opacity-60 disabled:hover:scale-100`}
          >
            <span className="text-4xl">{card.emoji}</span>
            <h2 className="mt-3 text-lg font-extrabold text-slate-900">{card.title}</h2>
            <p className="mt-1 text-sm font-medium text-slate-600">{card.desc}</p>
            <ul className="mt-3 space-y-1">
              {card.features.map((f) => (
                <li key={f} className="text-xs font-bold text-slate-700">
                  ✓ {f}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm font-extrabold text-slate-800">
              {loading === card.role ? "입장 중…" : "→ 원클릭 입장"}
            </p>
          </button>
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="relative z-10 mt-6 w-full max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
        >
          ⚠️ {error}
        </div>
      )}

      <p className="relative z-10 mt-8 text-center text-sm text-slate-500">
        실제 서비스 이용은{" "}
        <Link href="/login" className="font-bold text-sky-700 hover:underline">
          로그인
        </Link>
        {" · "}
        <Link href="/student-join" className="font-bold text-sky-700 hover:underline">
          학생 입장
        </Link>
        을 이용해 주세요.
      </p>
    </div>
  );
}
