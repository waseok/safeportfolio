import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreateClassForm } from "./create-class-form";
import { ClassesListClient } from "./classes-list-client";

export default async function ClassesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "teacher") redirect("/dashboard");

  const supabase = await createClient();
  const { data: classes } = await supabase
    .from("classes")
    .select("id, grade, class_number, code, name, created_at")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">학급 코드 관리</h1>
      <p className="text-sm text-slate-700">
        학급코드는 4자리 숫자로 직접 지정하거나 자동 생성할 수 있습니다.
        <br />
        학생들은 이 코드를 사용해 이름과 함께 학급에 입장합니다.
      </p>
      <CreateClassForm />
      <ClassesListClient initialClasses={classes ?? []} />
    </div>
  );
}

