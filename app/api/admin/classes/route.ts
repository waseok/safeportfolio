import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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
      return NextResponse.json({ error: "교사만 학급을 생성할 수 있습니다." }, { status: 403 });
    }

    const body = await request.json();
    const { grade, classNumber, name } = body as {
      grade: number | null;
      classNumber: number | null;
      name: string | null;
    };

    const supabase = createServiceClient();

    // 4자리 숫자 코드 생성 (중복 방지)
    let code: string | null = null;
    for (let i = 0; i < 10; i++) {
      const num = Math.floor(1000 + Math.random() * 9000);
      const candidate = String(num);
      const { data: exists } = await supabase
        .from("classes")
        .select("id")
        .eq("code", candidate)
        .maybeSingle();
      if (!exists) {
        code = candidate;
        break;
      }
    }
    if (!code) {
      return NextResponse.json(
        { error: "코드를 생성할 수 없습니다. 잠시 후 다시 시도해주세요." },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from("classes")
      .insert({
        teacher_id: user.id,
        grade,
        class_number: classNumber,
        name,
        code,
      })
      .select("id, code")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "학급을 저장하는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, classId: data.id, code: data.code });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

