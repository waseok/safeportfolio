import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "./admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "teacher") redirect("/dashboard");

  return (
    <div className="flex min-h-screen">
      {/* 좌측 사이드바 — 딥 네이비 톤 */}
      <AdminSidebar userName={user.name} />

      {/* 메인 콘텐츠 — 밝은 그레이 배경 */}
      <main className="relative flex-1 overflow-y-auto p-4 pb-20 pt-16 lg:p-10 lg:pb-10 lg:pt-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-[0.42]"
          style={{ backgroundImage: "url(/images/site-bg-illustration.png)" }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-white/52" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-slate-50/50" />
        <div className="relative z-0 mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
