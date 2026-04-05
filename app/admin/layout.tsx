import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "./logout-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "teacher") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-10 shadow-lg" style={{background: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #0369a1 100%)"}}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-2xl">👩‍🏫</span>
            <span className="text-lg font-black text-white tracking-tight drop-shadow-sm">
              교사 관리 페이지
            </span>
          </Link>
          <nav className="flex items-center gap-1.5">
            <Link href="/admin" className="rounded-full border border-white/40 bg-white/20 px-3 py-1.5 text-sm font-bold text-white hover:bg-white/35 transition-all">
              📋 인증 관리
            </Link>
            <Link href="/admin/classes" className="rounded-full border border-white/40 bg-white/20 px-3 py-1.5 text-sm font-bold text-white hover:bg-white/35 transition-all">
              🏫 학급 코드
            </Link>
            <Link href="/admin/items" className="rounded-full border border-white/40 bg-white/20 px-3 py-1.5 text-sm font-bold text-white hover:bg-white/35 transition-all">
              🎁 상점 관리
            </Link>
            <Link href="/admin/students" className="rounded-full border border-white/40 bg-white/20 px-3 py-1.5 text-sm font-bold text-white hover:bg-white/35 transition-all">
              👦 학생 관리
            </Link>
            <Link href="/admin/assignments" className="rounded-full px-3 py-1.5 text-sm font-black text-gray-900 shadow-md hover:opacity-90 transition-all"
              style={{background: "linear-gradient(135deg, #FFD700, #FFC107)"}}>
              📝 안전과제
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
