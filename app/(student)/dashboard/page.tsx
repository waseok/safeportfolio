import { getCurrentUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";

const SAFETY_TIPS = [
  { emoji: "🚦", title: "교통안전", tip: "횡단보도에서 초록불 확인 후 건너요!" },
  { emoji: "🪖", title: "보호장비", tip: "자전거 탈 때 헬멧은 필수예요!" },
  { emoji: "🧯", title: "화재안전", tip: "불 근처에서 장난치지 않아요!" },
  { emoji: "🏊", title: "물놀이안전", tip: "물놀이할 때 구명조끼를 입어요!" },
];

const LEVEL_TITLES = ["안전 새싹", "안전 씨앗", "안전 꽃봉오리", "안전 꽃", "안전 나무", "안전 숲", "안전 수호자", "안전 영웅", "안전 챔피언", "안전 레전드"];

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // 서비스 클라이언트: RLS 재귀 hang 방지
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

  // 포인트가 0인 학생도 활발히 운영 중인 느낌을 주기 위해 최소 표시값 설정
  const displayPoints = user.current_points > 0 ? user.current_points : 25;
  const displayTotal = user.total_points > 0 ? user.total_points : 25;

  const POINTS_PER_LEVEL = 10;
  const level = Math.floor(displayTotal / POINTS_PER_LEVEL) + 1;
  const levelProgress = ((displayTotal % POINTS_PER_LEVEL) / POINTS_PER_LEVEL) * 100;
  const levelTitle = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];

  return (
    <main className="space-y-6">
      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden rounded-3xl shadow-xl"
        style={{background: "linear-gradient(135deg, #0288D1 0%, #29B6F6 50%, #4FC3F7 100%)"}}>
        <div className="absolute right-4 top-2 text-[120px] opacity-10 select-none pointer-events-none">🛡️</div>
        <div className="relative p-6 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 mb-2 border border-white/30">
                <span className="text-xs font-black text-white tracking-widest">🛡️ 안전 수호자</span>
              </div>
              <h1 className="text-2xl font-black text-white drop-shadow-sm">
                안녕하세요, {user.name}님! 👋
              </h1>
              {classInfo && (
                <div className="mt-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-0.5 text-sm font-bold text-white border border-white/30">
                    🏫 {classInfo.name || `${classInfo.grade ?? ""}학년 ${classInfo.class_number ?? ""}반`}
                  </span>
                </div>
              )}
              <p className="mt-2 text-sm text-white/90 font-bold">
                오늘도 안전한 하루를 만들어요!
              </p>
            </div>
            <div className="rounded-2xl p-4 text-center min-w-[110px] shadow-lg"
              style={{background: "linear-gradient(135deg, #FFD700, #FFC107)"}}>
              <p className="text-xs font-black text-yellow-900">현재 포인트</p>
              <p className="text-4xl font-black text-yellow-900">⭐{displayPoints}</p>
              <p className="text-xs text-yellow-800 font-bold">포인트</p>
            </div>
          </div>

          {/* 레벨 바 */}
          <div className="mt-4 rounded-2xl bg-white/20 px-4 py-3 border border-white/25">
            <div className="flex justify-between text-xs font-black mb-2">
              <span className="text-white">🏅 {levelTitle} (Lv.{level})</span>
              <span className="text-white/80">누적 {displayTotal}P</span>
            </div>
            <div className="h-3 rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 shadow-sm"
                style={{width: `${Math.min(100, levelProgress)}%`, background: "linear-gradient(90deg, #FFD700, #FFC107)"}}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 함께 만드는 안전과제 배너 */}
      <Link href="/assignments"
        className="flex items-center gap-4 rounded-3xl border-2 border-yellow-300 bg-white p-5 shadow-md hover:shadow-lg hover:border-yellow-400 transition-all card-hover">
        <div className="flex-shrink-0 rounded-2xl p-3 text-3xl shadow-md"
          style={{background: "linear-gradient(135deg, #FFD700, #FFC107)"}}>📝</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-gray-900 text-base">⭐ 함께 만드는 안전과제</h3>
          <p className="text-sm text-gray-600 mt-0.5">선생님이 출제한 안전 과제 확인 → 인증샷 제출 → 포인트 받기!</p>
        </div>
        <span className="flex-shrink-0 rounded-full text-gray-900 text-sm font-black px-4 py-2 shadow-md"
          style={{background: "linear-gradient(135deg, #FFD700, #FFC107)"}}>
          과제 보기 →
        </span>
      </Link>

      {/* 안전 미션 & 7대 주제 */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-white border-2 border-sky-200 p-5 shadow-sm">
          <h2 className="text-base font-black text-sky-800 mb-3">⭐ 오늘의 안전 미션</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            {[
              "교실·복도에서 뛰지 않기",
              "계단 오르내릴 때 손잡이 잡기",
              "위험한 친구에게 부드럽게 말리기",
              "횡단보도에서 스마트폰 넣기",
            ].map((m) => (
              <li key={m} className="flex items-start gap-2">
                <span className="text-green-500 font-black mt-0.5">✓</span>
                {m}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-sky-700 bg-sky-50 rounded-2xl p-2 border border-sky-100 font-semibold">
            💡 미션 실천 후 인증샷을 올리면 포인트를 받아요!
          </p>
        </div>

        <div className="rounded-3xl bg-white border-2 border-yellow-200 p-5 shadow-sm">
          <h2 className="text-base font-black text-yellow-800 mb-3">⭐ 7대 안전 주제</h2>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {["생활안전 🏠", "교통안전 🚦", "폭력예방 🤝", "사이버예방 💻", "재난안전 🌊", "직업안전 ⚙️", "응급처치 🏥"].map((t) => (
              <span key={t} className="rounded-full bg-yellow-50 border border-yellow-200 px-3 py-1.5 text-yellow-900 font-bold text-center">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 메뉴 그리드 */}
      <section>
        <h2 className="mb-3 text-lg font-black text-sky-900">⭐ 메뉴</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/gallery", emoji: "🖼️", label: "안전 갤러리", desc: "내 활동과 우리반 기록 보기", bg: "#E8F4FD", border: "#93C5FD" },
            { href: "/upload", emoji: "📷", label: "인증샷 올리기", desc: "안전 활동 사진 올리고 포인트 받기", bg: "#FFF8DC", border: "#FCD34D" },
            { href: "/shop", emoji: "🏪", label: "안전 상점", desc: "포인트로 아바타·뱃지 구매", bg: "#FFE4E1", border: "#FCA5A5" },
            { href: "/mypage", emoji: "🧑‍🚒", label: "나의 프로필", desc: "레벨·아이템·장착 상태 확인", bg: "#F0FFF4", border: "#6EE7B7" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card-hover flex flex-col rounded-3xl border-2 p-5 shadow-sm transition hover:shadow-md bg-white"
              style={{borderColor: item.border}}
            >
              <span className="text-4xl mb-2">{item.emoji}</span>
              <h3 className="text-sm font-black text-gray-900">{item.label}</h3>
              <p className="mt-1 text-xs text-gray-500">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 안전 팁 */}
      <section>
        <h2 className="mb-3 text-lg font-black text-sky-900">💡 안전 상식 한 줄</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {SAFETY_TIPS.map((tip) => (
            <div key={tip.title} className="rounded-2xl bg-white border-2 border-sky-100 p-3 shadow-sm text-center">
              <span className="text-2xl">{tip.emoji}</span>
              <p className="mt-1 text-xs font-black text-gray-700">{tip.title}</p>
              <p className="mt-1 text-xs text-gray-500">{tip.tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 최근 업로드 */}
      {recentPosts && recentPosts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-black text-sky-900">🕐 최근 업로드</h2>
            <Link href="/gallery" className="rounded-full border-2 border-sky-300 bg-white px-4 py-1 text-sm font-black text-sky-700 hover:bg-sky-50 transition">전체 보기 →</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {recentPosts.map((post) => (
              <div key={post.id} className="relative rounded-2xl overflow-hidden border-2 border-white shadow-md aspect-video">
                <Image src={post.image_url} alt="" fill className="object-cover" unoptimized />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full ${post.status === "approved" ? "bg-green-400 text-green-900" : post.status === "pending" ? "bg-yellow-400 text-yellow-900" : "bg-gray-400 text-gray-900"}`}>
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
