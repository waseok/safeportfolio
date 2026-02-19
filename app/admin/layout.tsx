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
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="text-lg font-bold text-slate-800">
            SAFE 관리자
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/admin" className="text-slate-600 hover:underline">
              인증 관리
            </Link>
            <Link href="/admin/classes" className="text-slate-600 hover:underline">
              학급 코드
            </Link>
            <Link href="/admin/items" className="text-slate-600 hover:underline">
              상점 관리
            </Link>
            <Link href="/admin/students" className="text-slate-600 hover:underline">
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
