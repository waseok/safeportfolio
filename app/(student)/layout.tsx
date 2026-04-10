import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { StudentSidebar } from "./student-sidebar";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "teacher") redirect("/admin");

  return (
    <div className="flex min-h-screen">
      {/* 좌측 사이드바 */}
      <StudentSidebar userName={user.name} currentPoints={user.current_points} />

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-sky-50/60 via-white to-blue-50/40 p-8 lg:p-10">
        <div className="mx-auto max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
}
