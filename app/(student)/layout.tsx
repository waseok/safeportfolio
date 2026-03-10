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
      <header className="sticky top-0 z-10 shadow-lg" style={{background: "linear-gradient(135deg, #ff6b2b 0%, #ff8c42 40%, #ffd700 100%)"}}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <span className="text-lg font-bold text-white tracking-tight">
              안전 포트폴리오
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/20 hover:text-white transition-all">
              🏠 홈
            </Link>
            <Link href="/gallery" className="rounded-lg px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/20 hover:text-white transition-all">
              🖼️ 갤러리
            </Link>
            <Link href="/upload" className="rounded-lg bg-white/25 px-3 py-2 text-sm font-medium text-white hover:bg-white/40 transition-all border border-white/30">
              📷 업로드
            </Link>
            <Link href="/shop" className="rounded-lg px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/20 hover:text-white transition-all">
              🏪 상점
            </Link>
            <Link href="/mypage" className="rounded-lg px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/20 hover:text-white transition-all">
              🧑‍🚒 내 정보
            </Link>
            <div className="flex items-center gap-1 rounded-lg bg-white/20 px-3 py-2 border border-white/30">
              <span className="text-yellow-200 text-xs">⭐</span>
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
