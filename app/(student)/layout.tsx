import { getCurrentUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StudentSidebar } from "./student-sidebar";

const MIN_POINTS = 25;

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "teacher") redirect("/admin");

  // 포인트가 0인 학생은 DB에서 최소 25로 보정 (한 번만 실행됨)
  if (user.current_points < MIN_POINTS || user.total_points < MIN_POINTS) {
    const supabase = createServiceClient();
    await supabase
      .from("users")
      .update({
        current_points: Math.max(user.current_points, MIN_POINTS),
        total_points: Math.max(user.total_points, MIN_POINTS),
      })
      .eq("id", user.id);
    user.current_points = Math.max(user.current_points, MIN_POINTS);
    user.total_points = Math.max(user.total_points, MIN_POINTS);
  }

  return (
    <div className="flex min-h-screen">
      <StudentSidebar userName={user.name} currentPoints={user.current_points} />

      <main className="flex-1 overflow-y-auto bg-sky-50/60 p-4 pb-20 lg:p-10 lg:pb-10">
        <div className="mx-auto max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
}
