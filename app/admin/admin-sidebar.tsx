"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/admin", icon: "📋", label: "인증 관리", exact: true },
  { href: "/admin/classes", icon: "🏫", label: "학급 관리" },
  { href: "/admin/items", icon: "🎁", label: "상점 관리" },
  { href: "/admin/students", icon: "👦", label: "학생 관리" },
  { href: "/admin/assignments", icon: "📝", label: "안전과제" },
];

export function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col justify-between bg-white border-r border-slate-200 shadow-sm">
      {/* 상단: 로고 + 교사 정보 */}
      <div>
        <div className="flex flex-col items-center gap-2 border-b border-slate-200 px-5 py-5">
          <Image src="/logo.png" alt="SAFE 로고" width={72} height={72} />
          <p className="text-base font-bold text-slate-800 tracking-wide">교사 관리</p>
        </div>

        {/* 교사 카드 */}
        <div className="mx-4 mt-4 rounded-xl bg-slate-100 border border-slate-200 p-3 text-center">
          <p className="text-base font-semibold text-slate-700 truncate">{userName}</p>
          <p className="mt-0.5 text-xs text-slate-400">교사 계정</p>
        </div>

        {/* 네비게이션 */}
        <nav className="mt-5 flex flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 하단: 로그아웃 */}
      <div className="border-t border-slate-200 px-4 py-4">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
        >
          로그아웃
        </button>
      </div>
    </aside>
  );
}
