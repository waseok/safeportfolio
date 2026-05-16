"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "🏠", label: "홈" },
  { href: "/gallery", icon: "🖼️", label: "우리반 안전 갤러리" },
  { href: "/assignments", icon: "📝", label: "안전 과제 확인하기" },
  { href: "/upload", icon: "📷", label: "안전 과제 올리기" },
  { href: "/shop", icon: "🏪", label: "상점" },
  { href: "/mypage", icon: "🧑‍🚒", label: "내 정보" },
];

export type EquippedDecor = {
  image_url: string | null;
  type: string;
  name: string;
} | null;

export function StudentSidebar({
  userName,
  currentPoints,
  equippedItem,
}: {
  userName: string;
  currentPoints: number;
  equippedItem: EquippedDecor;
}) {
  const pathname = usePathname();
  const router = useRouter();
  /** 장착 뱃지는 이름 옆 작은 아이콘, 아바타/기타는 왼쪽 큰 원 */
  const isBadgeEquipped = equippedItem?.type === "badge";
  const showMainAvatarImage =
    equippedItem && !isBadgeEquipped && Boolean(equippedItem.image_url);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[17.5rem] flex-col justify-between border-r border-sky-100 bg-white shadow-sm lg:flex">
        <div>
          <div className="flex flex-col items-center gap-2 border-b border-sky-100 px-4 py-5">
            <Image
              src="/logo.png"
              alt="SAFE 로고"
              width={112}
              height={112}
              priority
              className="drop-shadow-sm"
            />
            <p className="text-center text-lg font-extrabold leading-tight text-slate-800">
              SAFE 포트폴리오
            </p>
          </div>

          {/* 아바타 + 이름 + 뱃지 */}
          <div className="mx-3 mt-4 rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 p-3">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border-2 border-white bg-sky-100 shadow-sm">
                {showMainAvatarImage ? (
                  <Image
                    src={equippedItem!.image_url!}
                    alt="장착 아바타"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl">🧑‍🚒</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="truncate text-lg font-extrabold text-slate-800">{userName}</p>
                  {isBadgeEquipped && (
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-amber-200 bg-amber-50">
                      {equippedItem?.image_url ? (
                        <Image
                          src={equippedItem.image_url}
                          alt={equippedItem.name}
                          width={32}
                          height={32}
                          className="object-contain"
                          unoptimized
                        />
                      ) : (
                        <span className="text-lg" title={equippedItem?.name}>
                          🏅
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xl font-extrabold text-amber-600">
                  ⭐ {currentPoints}P
                </p>
              </div>
            </div>
          </div>

          <nav className="mt-4 flex flex-col gap-1 px-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-bold transition-all ${
                    isActive
                      ? "bg-sky-100 text-sky-900 shadow-sm"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="text-2xl leading-none">{item.icon}</span>
                  <span className="leading-snug">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-sky-100 px-3 py-4">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
          >
            로그아웃
          </button>
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-sky-100 bg-white px-3 py-2 shadow-sm lg:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-sky-200 bg-sky-50">
            {showMainAvatarImage ? (
              <Image
                src={equippedItem!.image_url!}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl">🧑‍🚒</div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <p className="truncate text-sm font-extrabold text-slate-800">{userName}</p>
              {isBadgeEquipped && (
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-amber-100">
                  {equippedItem?.image_url ? (
                    <Image
                      src={equippedItem.image_url}
                      alt=""
                      width={22}
                      height={22}
                      className="object-contain"
                      unoptimized
                    />
                  ) : (
                    <span className="text-sm">🏅</span>
                  )}
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-amber-600">⭐ {currentPoints}P</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          로그아웃
        </button>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-sky-100 bg-white pb-2 shadow-[0_-2px_12px_rgba(0,0,0,0.08)] lg:hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-bold transition-colors ${
                isActive ? "text-sky-700" : "text-slate-400"
              }`}
            >
              <span className={`text-xl leading-none ${isActive ? "scale-110" : ""} transition-transform`}>
                {item.icon}
              </span>
              <span className="line-clamp-2 text-center px-0.5">{item.label.replace(/\s/g, "\u00a0")}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
