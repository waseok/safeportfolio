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
    <div className="min-h-screen bg-amber-50/80">
      <header className="sticky top-0 z-10 border-b border-amber-200 bg-white/95 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="text-lg font-bold text-amber-900">
            SAFE
          </Link>
          <nav className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link href="/dashboard" className="text-amber-800 hover:underline">
              홈
            </Link>
            <Link href="/gallery" className="text-amber-800 hover:underline">
              갤러리
            </Link>
            <Link href="/upload" className="text-amber-800 hover:underline">
              업로드
            </Link>
            <Link href="/shop" className="text-amber-800 hover:underline">
              상점
            </Link>
            <Link href="/mypage" className="text-amber-800 hover:underline">
              마이페이지
            </Link>
            <HeaderPoints value={user.current_points} />
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
