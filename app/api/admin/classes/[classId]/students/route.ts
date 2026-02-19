import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** 교사 전용. 내 학급의 학생 목록 반환 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    if (!classId) {
      return NextResponse.json({ error: "학급 ID가 필요합니다." }, { status: 400 });
    }

    const auth = await createClient();
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    const { data: profile } = await auth
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "teacher") {
      return NextResponse.json({ error: "교사만 조회할 수 있습니다." }, { status: 403 });
    }

    const { data: klass, error: classError } = await auth
      .from("classes")
      .select("id")
      .eq("id", classId)
      .eq("teacher_id", user.id)
      .maybeSingle();

    if (classError || !klass) {
      return NextResponse.json({ error: "해당 학급을 찾을 수 없거나 권한이 없습니다." }, { status: 404 });
    }

    const { data: students, error: studentsError } = await auth
      .from("users")
      .select("id, name, student_number, current_points, total_points")
      .eq("role", "student")
      .eq("class_id", classId)
      .order("student_number", { ascending: true });

    if (studentsError) {
      return NextResponse.json(
        { error: "학생 목록을 불러오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }
    return NextResponse.json({ students: students ?? [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
