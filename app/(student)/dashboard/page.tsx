import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50 px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        {/* 상단 인사 + 안전 슬로건 */}
        <section className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-sky-500 to-emerald-500 p-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-100">
              SAFE DASHBOARD
            </p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              안녕하세요, {user.name}님
            </h1>
            <p className="mt-2 text-sm text-sky-50/90">
              오늘도 <span className="font-semibold">안전 수호자</span>로서의 하루를
              기록해 볼까요?
            </p>
          </div>
          <div className="mt-2 flex flex-col rounded-2xl bg-white/10 p-4 text-sm sm:mt-0">
            <span className="text-xs font-medium text-sky-100">오늘의 다짐</span>
            <span className="mt-1 text-sm font-semibold">
              &quot;내 안전, 친구의 안전, 우리가 함께 지켜요&quot;
            </span>
          </div>
        </section>

        {/* 포인트 카드 */}
        <section className="grid gap-4 md:grid-cols-[1.4fr,1fr]">
          <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-50" />
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-emerald-700">
                  보유 안전 포인트
                </p>
                <p className="mt-2 text-4xl font-extrabold text-emerald-600">
                  {user.current_points}
                  <span className="ml-1 text-lg font-semibold">P</span>
                </p>
                <p className="mt-2 text-xs text-emerald-800/80">
                  누적 {user.total_points} P · 안전 습관이 쌓일수록 레벨이 올라가요.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-b from-amber-50 to-emerald-50 px-4 py-3 text-xs text-emerald-800">
                <span className="text-3xl">🦺</span>
                <span className="font-semibold">오늘도 안전하게</span>
                <span className="text-[11px] text-emerald-700/80">
                  횡단보도, 계단, 실내 활동까지
                  <br />
                  안전 수칙을 잘 지켜보세요.
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-3xl border border-sky-100 bg-sky-50/60 p-4 text-xs text-sky-900 shadow-sm">
            <p className="text-sm font-semibold">오늘 할 수 있는 안전 미션</p>
            <ul className="space-y-1.5">
              <li>✅ 교실·복도에서 뛰지 않기</li>
              <li>✅ 계단 오르내릴 때 손잡이 잡기</li>
              <li>✅ 실험·실습 전 보호 장비 제대로 착용하기</li>
              <li>✅ 친구가 위험한 행동을 할 때 부드럽게 말리기</li>
            </ul>
            <p className="mt-1 text-[11px] text-sky-800/80">
              미션을 실천하고 인증샷을 올리면 선생님이 확인 후 포인트를 더해 주어요.
            </p>
          </div>
        </section>

        {/* 주요 메뉴 그리드 */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-800 sm:text-base">
            안전 활동 관리
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/gallery"
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-400 hover:shadow-md"
            >
              <span className="text-2xl">📚</span>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                안전 갤러리
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                내가 실천한 안전 활동과 선생님 피드백을 한눈에 보기.
              </p>
            </Link>

            <Link
              href="/upload"
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-400 hover:shadow-md"
            >
              <span className="text-2xl">📷</span>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                인증샷 올리기
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                오늘 실천한 안전 행동을 사진으로 남기고 포인트 받기.
              </p>
            </Link>

            <Link
              href="/shop"
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-400 hover:shadow-md"
            >
              <span className="text-2xl">🏪</span>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                안전 상점
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                모은 포인트로 아바타·뱃지 등 보상을 선택해 보세요.
              </p>
            </Link>

            <Link
              href="/mypage"
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-400 hover:shadow-md"
            >
              <span className="text-2xl">🧑‍🚒</span>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                나의 안전 프로필
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                레벨, 보유 아이템, 장착 상태를 확인하고 꾸며 보세요.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
