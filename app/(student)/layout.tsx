import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "./logout-button";
import { HeaderPoints } from "./header-points";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "teacher") redirect("/admin");

  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-10 shadow-md" style={{background: "linear-gradient(135deg, #4FC3F7 0%, #29B6F6 50%, #0288D1 100%)"}}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <span className="text-lg font-black text-white tracking-tight drop-shadow-sm">
              안전 포트폴리오
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1.5">
            <Link href="/dashboard" className="rounded-full border border-white/40 bg-white/20 px-3 py-1.5 text-sm font-bold text-white hover:bg-white/35 transition-all">
              🏠 홈
            </Link>
            <Link href="/gallery" className="rounded-full border border-white/40 bg-white/20 px-3 py-1.5 text-sm font-bold text-white hover:bg-white/35 transition-all">
              🖼️ 갤러리
            </Link>
            <Link href="/assignments" className="rounded-full border border-white/40 bg-white/20 px-3 py-1.5 text-sm font-bold text-white hover:bg-white/35 transition-all">
              📝 과제
            </Link>
            <Link href="/upload" className="rounded-full px-3 py-1.5 text-sm font-black text-gray-900 shadow-md transition-all hover:opacity-90"
              style={{background: "linear-gradient(135deg, #FFD700, #FFC107)"}}>
              📷 업로드
            </Link>
            <Link href="/shop" className="rounded-full border border-white/40 bg-white/20 px-3 py-1.5 text-sm font-bold text-white hover:bg-white/35 transition-all">
              🏪 상점
            </Link>
            <Link href="/mypage" className="rounded-full border border-white/40 bg-white/20 px-3 py-1.5 text-sm font-bold text-white hover:bg-white/35 transition-all">
              🧑‍🚒 내 정보
            </Link>
            <div className="flex items-center gap-1 rounded-full px-3 py-1.5 shadow-md"
              style={{background: "linear-gradient(135deg, #FFD700, #FFC107)"}}>
              <span className="text-base">⭐</span>
              <HeaderPoints value={user.current_points} />
            </div>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
