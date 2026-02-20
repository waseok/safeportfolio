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
      <header className="sticky top-0 z-10 border-b-2 border-sky-300 bg-gradient-to-r from-sky-100 via-indigo-100 to-violet-100 shadow-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="text-2xl font-black text-slate-800">
            SAFE 관리자
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/admin" className="text-base font-semibold text-slate-700 hover:underline">
              인증 관리
            </Link>
            <Link href="/admin/classes" className="text-base font-semibold text-slate-700 hover:underline">
              학급 코드
            </Link>
            <Link href="/admin/items" className="text-base font-semibold text-slate-700 hover:underline">
              상점 관리
            </Link>
            <Link href="/admin/students" className="text-base font-semibold text-slate-700 hover:underline">
              학생 관리
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
