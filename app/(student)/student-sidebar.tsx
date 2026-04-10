"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "🏠", label: "홈" },
  { href: "/gallery", icon: "🖼️", label: "갤러리" },
  { href: "/assignments", icon: "📝", label: "안전과제" },
  { href: "/upload", icon: "📷", label: "업로드" },
  { href: "/shop", icon: "🏪", label: "상점" },
  { href: "/mypage", icon: "🧑‍🚒", label: "내 정보" },
];

export function StudentSidebar({
  userName,
  currentPoints,
}: {
  userName: string;
  currentPoints: number;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 flex h-screen w-60 flex-col justify-between border-r border-sky-100 bg-white/80 backdrop-blur-sm shadow-sm">
      {/* 상단: 로고 + 유저 정보 */}
      <div>
        <div className="flex flex-col items-center gap-2 border-b border-sky-100 px-5 py-6">
          <Image src="/logo.png" alt="SAFE 로고" width={56} height={56} />
          <p className="text-sm font-bold text-slate-700 leading-tight text-center">
            안전 포트폴리오
          </p>
        </div>

        {/* 유저 카드 */}
        <div className="mx-4 mt-4 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 p-3 text-center">
          <p className="text-sm font-bold text-slate-700 truncate">{userName}</p>
          <p className="mt-1 text-lg font-extrabold text-amber-600">⭐ {currentPoints > 0 ? currentPoints : 25}P</p>
        </div>

        {/* 네비게이션 */}
        <nav className="mt-5 flex flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-sky-100 text-sky-800 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 하단: 로그아웃 */}
      <div className="border-t border-sky-100 px-4 py-4">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
        >
          로그아웃
        </button>
      </div>
    </aside>
  );
}
