import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { data: recentPosts } = await supabase
    .from("gallery_posts")
    .select("id, image_url, category, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: classInfo } = user.class_id
    ? await supabase.from("classes").select("name, grade, class_number").eq("id", user.class_id).single()
    : { data: null };

  const POINTS_PER_LEVEL = 10;
  const level = Math.floor(user.total_points / POINTS_PER_LEVEL) + 1;
  const levelProgress = ((user.total_points % POINTS_PER_LEVEL) / POINTS_PER_LEVEL) * 100;
  const levelTitle = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];

  return (
    <main className="space-y-6">
      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl"
        style={{background: "linear-gradient(135deg, #ff6b2b 0%, #ff8c42 50%, #ffd700 100%)"}}>
        <div className="absolute right-0 top-0 text-[120px] opacity-10 select-none">🛡️</div>
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-orange-100 uppercase tracking-widest">안전 수호자</p>
              <h1 className="mt-1 text-3xl font-black">
                안녕하세요, {user.name}님! 👋
              </h1>
              {classInfo && (
                <p className="mt-1 text-orange-100 text-sm">
                  🏫 {classInfo.grade}학년 {classInfo.class_number}반
                </p>
              )}
              <p className="mt-2 text-orange-50 text-sm">
                오늘도 안전한 하루를 만들어요!
              </p>
            </div>
            <div className="rounded-2xl bg-white/20 p-4 text-center backdrop-blur-sm border border-white/30 min-w-[120px]">
              <p className="text-xs font-bold text-orange-100">현재 포인트</p>
              <p className="text-4xl font-black text-white">{user.current_points}</p>
              <p className="text-xs text-orange-200">P</p>
            </div>
          </div>

          {/* 레벨 바 */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-orange-100 mb-1">
              <span>🏅 {levelTitle} (Lv.{level})</span>
              <span>누적 {user.total_points}P</span>
            </div>
            <div className="h-3 rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-700"
                style={{width: `${Math.min(100, levelProgress)}%`}}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 안전 미션 카드 */}
      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-sky-100 border border-blue-200 p-5 shadow-sm">
          <h2 className="text-base font-black text-blue-900 mb-3">✅ 오늘의 안전 미션</h2>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold mt-0.5">✓</span>
              교실·복도에서 뛰지 않기
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold mt-0.5">✓</span>
              계단 오르내릴 때 손잡이 잡기
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold mt-0.5">✓</span>
              위험한 친구에게 부드럽게 말리기
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold mt-0.5">✓</span>
              횡단보도에서 스마트폰 넣기
            </li>
          </ul>
          <p className="mt-3 text-xs text-blue-600 bg-blue-100 rounded-lg p-2">
            💡 미션 실천 후 인증샷을 올리면 포인트를 받아요!
          </p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 p-5 shadow-sm">
          <h2 className="text-base font-black text-emerald-900 mb-3">📚 7대 안전 주제</h2>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {["생활안전 🏠", "교통안전 🚦", "폭력예방 🤝", "사이버예방 💻", "재난안전 🌊", "직업안전 ⚙️", "응급처치 🏥"].map((t) => (
              <span key={t} className="rounded-lg bg-white/70 px-2 py-1.5 text-emerald-800 font-medium text-center border border-emerald-200">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 메뉴 그리드 */}
      <section>
        <h2 className="mb-3 text-lg font-black text-gray-800">🗂️ 메뉴</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/gallery", emoji: "🖼️", label: "안전 갤러리", desc: "내 활동과 우리반 기록 보기", color: "from-purple-50 to-violet-100 border-purple-200 hover:border-purple-400" },
            { href: "/upload", emoji: "📷", label: "인증샷 올리기", desc: "안전 활동 사진 올리고 포인트 받기", color: "from-orange-50 to-amber-100 border-orange-200 hover:border-orange-400" },
            { href: "/shop", emoji: "🏪", label: "안전 상점", desc: "포인트로 아바타·뱃지 구매", color: "from-pink-50 to-rose-100 border-pink-200 hover:border-pink-400" },
            { href: "/mypage", emoji: "🧑‍🚒", label: "나의 프로필", desc: "레벨·아이템·장착 상태 확인", color: "from-sky-50 to-blue-100 border-sky-200 hover:border-sky-400" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`card-hover flex flex-col rounded-2xl border bg-gradient-to-br p-4 shadow-sm transition ${item.color}`}
            >
              <span className="text-3xl mb-2">{item.emoji}</span>
              <h3 className="text-sm font-black text-gray-900">{item.label}</h3>
              <p className="mt-1 text-xs text-gray-600">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 안전 팁 */}
      <section>
        <h2 className="mb-3 text-lg font-black text-gray-800">💡 안전 상식 한 줄</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {SAFETY_TIPS.map((tip) => (
            <div key={tip.title} className="rounded-xl bg-white border border-gray-100 p-3 shadow-sm text-center">
              <span className="text-2xl">{tip.emoji}</span>
              <p className="mt-1 text-xs font-bold text-gray-700">{tip.title}</p>
              <p className="mt-1 text-xs text-gray-500">{tip.tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 최근 업로드 */}
      {recentPosts && recentPosts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-black text-gray-800">🕐 최근 업로드</h2>
            <Link href="/gallery" className="text-sm text-orange-600 font-semibold hover:underline">전체 보기 →</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {recentPosts.map((post) => (
              <div key={post.id} className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm aspect-video">
                <Image src={post.image_url} alt="" fill className="object-cover" unoptimized />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${post.status === "approved" ? "bg-green-400 text-green-900" : post.status === "pending" ? "bg-yellow-400 text-yellow-900" : "bg-gray-400 text-gray-900"}`}>
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
