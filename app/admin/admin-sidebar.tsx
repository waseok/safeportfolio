"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/admin", icon: "📋", label: "과제 인증 관리", exact: true },
  { href: "/admin/classes", icon: "🏫", label: "학급 관리" },
  { href: "/admin/items", icon: "🏷️", label: "상점 관리" },
  { href: "/admin/students", icon: "👦", label: "학생 관리" },
  { href: "/admin/assignments", icon: "📝", label: "안전 과제 관리" },
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
    <>
      {/* 데스크탑 사이드바 (lg 이상에서만 표시) */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col justify-between border-r border-slate-200 bg-white shadow-sm lg:flex">
        {/* 상단: 로고 + 교사 정보 */}
        <div>
          <div className="flex flex-col items-center gap-3 border-b border-slate-200 px-5 py-6">
            <Image src="/logo.png" alt="SAFE 로고" width={100} height={100} />
            <p className="text-xl font-extrabold tracking-wide text-slate-800">교사 로그인</p>
          </div>

          {/* 교사 카드 */}
          <div className="mx-4 mt-4 rounded-xl border border-slate-200 bg-slate-100 p-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">👩‍🏫</span>
              <p className="truncate text-base font-semibold text-slate-700">{userName}</p>
            </div>
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
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-[17px] font-semibold transition-all ${
                    isActive
                      ? "border border-indigo-200 bg-indigo-50 font-semibold text-indigo-700"
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

      {/* 모바일 상단바 (lg 미만) */}
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 shadow-sm lg:hidden">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="SAFE" width={32} height={32} />
          <div>
            <p className="text-sm font-bold text-slate-700 leading-tight">{userName}</p>
            <p className="text-xs text-slate-400">교사</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50"
        >
          로그아웃
        </button>
      </header>

      {/* 모바일 하단 탭바 (lg 미만에서만 표시) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-slate-200 bg-white shadow-[0_-2px_12px_rgba(0,0,0,0.08)] lg:hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[12px] font-semibold transition-colors leading-tight ${
                isActive ? "text-indigo-600" : "text-slate-400"
              }`}
            >
              <span className={`text-xl leading-none ${isActive ? "scale-110" : ""} transition-transform`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
