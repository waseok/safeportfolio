import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** 교사 전용. 내 학급 학생에게 포인트 직접 지급 */
export async function POST(request: Request) {
  try {
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
      return NextResponse.json(
        { error: "교사만 포인트를 지급할 수 있습니다." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { studentId, points } = body as { studentId: string; points: number };
    if (!studentId || typeof studentId !== "string") {
      return NextResponse.json({ error: "학생 ID가 필요합니다." }, { status: 400 });
    }
    const pointsNum = typeof points === "number" ? points : parseInt(String(points), 10);
    if (!Number.isInteger(pointsNum) || pointsNum < 1 || pointsNum > 100) {
      return NextResponse.json(
        { error: "포인트는 1~100 사이 정수여야 합니다." },
        { status: 400 }
      );
    }

    const { data: student, error: studentError } = await auth
      .from("users")
      .select("id, class_id, current_points, total_points")
      .eq("id", studentId)
      .eq("role", "student")
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: "해당 학생을 찾을 수 없습니다." }, { status: 404 });
    }
    if (!student.class_id) {
      return NextResponse.json({ error: "학급에 소속되지 않은 학생입니다." }, { status: 400 });
    }

    const { data: klass } = await auth
      .from("classes")
      .select("id")
      .eq("id", student.class_id)
      .eq("teacher_id", user.id)
      .maybeSingle();

    if (!klass) {
      return NextResponse.json(
        { error: "본인 학급의 학생에게만 포인트를 지급할 수 있습니다." },
        { status: 403 }
      );
    }

    const newCurrent = (student.current_points ?? 0) + pointsNum;
    const newTotal = (student.total_points ?? 0) + pointsNum;

    const { error: updateError } = await auth
      .from("users")
      .update({
        current_points: newCurrent,
        total_points: newTotal,
      })
      .eq("id", studentId);

    if (updateError) {
      return NextResponse.json(
        { error: "포인트 지급 처리 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }
    return NextResponse.json({
      ok: true,
      newCurrentPoints: newCurrent,
      newTotalPoints: newTotal,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
