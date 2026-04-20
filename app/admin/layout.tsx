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
      <main className="flex-1 overflow-y-auto bg-sky-50/50 p-4 pb-20 lg:p-10 lg:pb-10">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
