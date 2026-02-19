import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreateClassForm } from "./create-class-form";

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
        학급을 만들면 4자리 숫자 코드가 자동으로 생성됩니다.
        <br />
        학생들은 이 코드를 사용해 이름·번호만으로 학급에 입장합니다.
      </p>
      <CreateClassForm />
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">내 학급 목록</h2>
        {!classes?.length ? (
          <p className="text-slate-600">아직 생성한 학급이 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {classes.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {c.name ?? `${c.grade ?? "-"}학년 ${c.class_number ?? "-"}반`}
                  </p>
                  <p className="text-xs text-slate-600">
                    학급코드{" "}
                    <span className="font-mono text-base text-slate-900">
                      {c.code}
                    </span>
                  </p>
                </div>
                <p className="text-xs text-slate-500">
                  학생: 이름 · 번호 · 코드만 입력
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

