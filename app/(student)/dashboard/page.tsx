import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-amber-900">
        안녕하세요, {user.name}님
      </h1>
      <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow">
        <p className="mb-2 text-amber-800">보유 포인트</p>
        <p className="text-3xl font-bold text-amber-600">
          {user.current_points}
          <span className="ml-1 text-lg font-normal">P</span>
        </p>
        <p className="mt-2 text-sm text-amber-700/80">
          누적 {user.total_points} P (레벨 업에 반영)
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/gallery"
          className="rounded-xl border border-amber-200 bg-white p-6 shadow transition hover:border-amber-400 hover:shadow-md"
        >
          <h2 className="font-semibold text-amber-900">갤러리</h2>
          <p className="mt-1 text-sm text-amber-700/80">
            내 인증샷과 선생님 피드백 보기
          </p>
        </Link>
        <Link
          href="/upload"
          className="rounded-xl border border-amber-200 bg-white p-6 shadow transition hover:border-amber-400 hover:shadow-md"
        >
          <h2 className="font-semibold text-amber-900">인증샷 업로드</h2>
          <p className="mt-1 text-sm text-amber-700/80">
            안전 활동 사진 올리기
          </p>
        </Link>
        <Link
          href="/shop"
          className="rounded-xl border border-amber-200 bg-white p-6 shadow transition hover:border-amber-400 hover:shadow-md"
        >
          <h2 className="font-semibold text-amber-900">아이템 상점</h2>
          <p className="mt-1 text-sm text-amber-700/80">
            포인트로 아바타·아이템 구매
          </p>
        </Link>
        <Link
          href="/mypage"
          className="rounded-xl border border-amber-200 bg-white p-6 shadow transition hover:border-amber-400 hover:shadow-md"
        >
          <h2 className="font-semibold text-amber-900">마이페이지</h2>
          <p className="mt-1 text-sm text-amber-700/80">
            보유 아이템·레벨·장착
          </p>
        </Link>
      </div>
    </div>
  );
}
