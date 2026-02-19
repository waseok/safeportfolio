import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminStudentsClient } from "./admin-students-client";

export default async function AdminStudentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "teacher") redirect("/dashboard");

  const supabase = await createClient();
  const { data: classes } = await supabase
    .from("classes")
    .select("id, grade, class_number, name, code")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">학생 관리</h1>
      <p className="text-sm text-slate-700">
        학급을 선택하면 해당 학급 학생 목록을 볼 수 있고, 안전 행동 인증 등으로 포인트를 직접 지급할 수 있습니다.
      </p>
      <AdminStudentsClient classes={classes ?? []} />
    </div>
  );
}
