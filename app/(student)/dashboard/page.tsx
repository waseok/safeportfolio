import { getCurrentUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { CATEGORY_CARD_THEME } from "@/lib/assignments-data";
import { fetchActiveAssignmentsByCategory } from "@/lib/assignments-server";

const LEVEL_TITLES = [
  "안전 새싹",
  "안전 씨앗",
  "안전 꽃봉오리",
  "안전 꽃",
  "안전 나무",
  "안전 숲",
  "안전 수호자",
  "안전 영웅",
  "안전 챔피언",
  "안전 레전드",
];

/** 학생 첫 화면 SAFE 프로젝트 링크 — 순서 고정, 썸네일 `/public/images/` */
const SAFE_PROJECT_LINKS = [
  {
    href: "https://safety-life-game.vercel.app/",
    title: "SAFE 인생게임",
    desc: "7대 안전 영역에서 선택의 순간을 겪으며 안전문해력을 키워요.",
    thumb: "/images/thumb-safe-life-game.png",
  },
  {
    href: "https://safemap-pi.vercel.app/",
    title: "SAFE 안전 탐사 지도",
    desc: "우리 동네 위험 요소를 찾아 기록하고 해결 방법을 제안해요.",
    thumb: "/images/thumb-safe-map.png",
  },
  {
    href: "https://questionhero.vercel.app/",
    title: "질문 히어로",
    desc: "함께 묻고 배우며 성장하는 질문 학습 활동으로 이동해요.",
    thumb: "/images/thumb-question-hero.png",
  },
] as const;

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createServiceClient();
  const { data: recentPosts } = await supabase
    .from("gallery_posts")
    .select("id, image_url, category, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: classInfo } = user.class_id
    ? await supabase.from("classes").select("name, grade, class_number").eq("id", user.class_id).single()
    : { data: null };

  const displayPoints = user.current_points;
  const displayTotal = user.total_points;

  const POINTS_PER_LEVEL = 10;
  const level = Math.floor(displayTotal / POINTS_PER_LEVEL) + 1;
  const levelProgress = ((displayTotal % POINTS_PER_LEVEL) / POINTS_PER_LEVEL) * 100;
  const levelTitle = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];

  const missionsOrdered = await fetchActiveAssignmentsByCategory(supabase);

  return (
    <main className="space-y-6">
      <section
        className="relative overflow-hidden rounded-3xl shadow-xl"
        style={{
          background: "linear-gradient(135deg, #0288D1 0%, #29B6F6 50%, #4FC3F7 100%)",
        }}
      >
        <div className="absolute right-4 top-2 text-[120px] opacity-10 select-none pointer-events-none">🛡️</div>
        <div className="relative p-6 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 mb-2 border border-white/30">
                <span className="text-xs font-black text-white tracking-widest">세이프 포트폴리오</span>
              </div>
              <h1 className="text-2xl font-black text-white drop-shadow-sm">안녕하세요, {user.name}님! 👋</h1>
              {classInfo && (
                <div className="mt-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-0.5 text-sm font-bold text-white border border-white/30">
                    🏫 {classInfo.name || `${classInfo.grade ?? ""}학년 ${classInfo.class_number ?? ""}반`}
                  </span>
                </div>
              )}
              <p className="mt-2 text-sm text-white/90 font-bold">
                안전 과제와 연결된 활동부터 차근차근 실천해 봐요!
              </p>
            </div>
            <div
              className="rounded-2xl p-4 text-center min-w-[110px] shadow-lg"
              style={{ background: "linear-gradient(135deg, #FFD700, #FFC107)" }}
            >
              <p className="text-xs font-black text-yellow-900">현재 포인트</p>
              <p className="text-4xl font-black text-yellow-900">⭐{displayPoints}</p>
              <p className="text-xs text-yellow-800 font-bold">포인트</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white/20 px-4 py-3 border border-white/25">
            <div className="flex justify-between text-xs font-black mb-2">
              <span className="text-white">🏅 {levelTitle} (Lv.{level})</span>
              <span className="text-white/80">누적 {displayTotal}P</span>
            </div>
            <div className="h-3 rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 shadow-sm"
                style={{
                  width: `${Math.min(100, levelProgress)}%`,
                  background: "linear-gradient(90deg, #FFD700, #FFC107)",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border-2 border-sky-200 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
        <h2 className="mb-2 text-lg font-black text-sky-950">🔗 SAFE 프로그램 함께하기</h2>
        <p className="mb-4 text-sm font-semibold text-slate-600">
          인생게임 · 안전 탐사 지도 · 질문 히어로로 이동해 추가 활동을 해 보세요.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {SAFE_PROJECT_LINKS.map((site) => (
            <a
              key={site.href}
              href={site.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-b from-sky-50/80 to-white shadow-sm transition hover:border-sky-300 hover:shadow-md"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                <Image
                  src={site.thumb}
                  alt=""
                  fill
                  className="object-cover transition group-hover:scale-[1.03]"
                  sizes="(max-width:768px) 100vw, 33vw"
                />
              </div>
              <div className="p-3">
                <p className="text-base font-black text-slate-900">{site.title}</p>
                <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-600">{site.desc}</p>
                <span className="mt-2 inline-block text-xs font-bold text-sky-700 underline-offset-2 group-hover:underline">
                  새 창으로 열기 →
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <Link
        href="/assignments"
        className="flex items-center gap-4 rounded-3xl border-2 border-sky-300 bg-white p-5 shadow-md hover:shadow-lg hover:border-sky-400 transition-all card-hover"
      >
        <div
          className="flex-shrink-0 rounded-2xl p-3 text-3xl shadow-md text-white"
          style={{ background: "linear-gradient(135deg, #0284c7, #0ea5e9, #38bdf8)" }}
        >
          📝
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-gray-900 text-lg">안전 과제 확인하기</h3>
          <p className="text-base text-gray-600 mt-0.5">
            7대 안전 영역 과제 확인 → 인증샷 제출 → 포인트 받기!
          </p>
        </div>
        <span
          className="flex-shrink-0 rounded-full text-white text-sm font-black px-4 py-2 shadow-md"
          style={{ background: "linear-gradient(135deg, #0284c7, #0ea5e9)" }}
        >
          과제 보기 →
        </span>
      </Link>

      <section className="rounded-3xl bg-white border-2 border-sky-200 p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-sky-900">오늘의 안전 미션</h2>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              아래는 <strong className="text-sky-800">안전 과제 페이지</strong>와 같은 활동입니다. 각 영역(7대 안전)이
              카테고리 뱃지로 표시돼요.
            </p>
          </div>
          <Link
            href="/assignments"
            className="shrink-0 rounded-full bg-sky-600 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-sky-700 transition"
          >
            전체 과제 보기
          </Link>
        </div>
        <ul className="space-y-3">
          {missionsOrdered.map((assignment) => {
            const theme = CATEGORY_CARD_THEME[assignment.category];
            const chipClass =
              theme?.chip ?? "bg-slate-100 text-slate-800 border-slate-300";
            const leftAccent = theme?.border ?? "border-l-slate-400";
            const href = `/upload?assignment=${encodeURIComponent(assignment.title)}&category=${encodeURIComponent(assignment.category)}`;
            const nearDue =
              new Date(assignment.dueDate).getTime() - Date.now() <
              14 * 24 * 60 * 60 * 1000;

            return (
              <li
                key={assignment.id}
                className={`flex flex-wrap items-start gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 sm:items-center border-l-[6px] ${leftAccent}`}
              >
                <span className="text-3xl">{assignment.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-black ${chipClass}`}>
                      {assignment.category}
                    </span>
                    {nearDue && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                        마감 가까움
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-black text-slate-900">{assignment.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs font-medium text-slate-600">
                    {assignment.description}
                  </p>
                  <p className="mt-1 text-[11px] font-bold text-slate-500">
                    마감 {assignment.dueDate} · {assignment.points}P
                  </p>
                </div>
                <Link
                  href={href}
                  className={`shrink-0 rounded-xl bg-gradient-to-r px-4 py-2 text-xs font-black text-white shadow-sm hover:opacity-90 ${theme?.accent ?? "from-sky-500 to-sky-600"}`}
                >
                  인증하기
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-black text-sky-900">메뉴</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              href: "/gallery",
              emoji: "🖼️",
              label: "우리반 안전 갤러리",
              desc: "내 활동과 우리반 기록 보기",
              border: "#93C5FD",
            },
            {
              href: "/upload",
              emoji: "📷",
              label: "안전 과제 올리기",
              desc: "과제별 인증샷 올리고 포인트 받기",
              border: "#FCD34D",
            },
            { href: "/shop", emoji: "🏪", label: "안전 상점", desc: "포인트로 아이템 구매", border: "#FCA5A5" },
            {
              href: "/mypage",
              emoji: "🧑‍🚒",
              label: "나의 프로필",
              desc: "레벨·아이템·장착 확인",
              border: "#6EE7B7",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card-hover flex flex-col rounded-3xl border-2 p-5 shadow-sm transition hover:shadow-md bg-white"
              style={{ borderColor: item.border }}
            >
              <span className="text-4xl mb-2">{item.emoji}</span>
              <h3 className="text-sm font-black text-gray-900">{item.label}</h3>
              <p className="mt-1 text-xs text-gray-500">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {recentPosts && recentPosts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-black text-sky-900">🕐 최근 업로드</h2>
            <Link
              href="/gallery"
              className="rounded-full border-2 border-sky-300 bg-white px-4 py-1 text-sm font-black text-sky-700 hover:bg-sky-50 transition"
            >
              전체 보기 →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="relative rounded-2xl overflow-hidden border-2 border-white shadow-md aspect-video"
              >
                <Image src={post.image_url} alt="" fill className="object-cover" unoptimized />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      post.status === "approved"
                        ? "bg-green-400 text-green-900"
                        : post.status === "pending"
                          ? "bg-yellow-400 text-yellow-900"
                          : "bg-gray-400 text-gray-900"
                    }`}
                  >
                    {post.status === "approved" ? "✓ 승인" : post.status === "pending" ? "⏳ 대기" : "반려"}
                  </span>
                  <p className="text-xs text-white mt-1">{post.category ?? "-"}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
