import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
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
      return NextResponse.json({ error: "교사만 수정할 수 있습니다." }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const code =
      typeof body.code === "string" ? body.code.trim().replace(/\D/g, "").slice(0, 4) : "";

    if (!/^\d{4}$/.test(code)) {
      return NextResponse.json(
        { error: "학급코드는 숫자 4자리로 입력해주세요." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: dup } = await supabase
      .from("classes")
      .select("id")
      .eq("code", code)
      .neq("id", id)
      .maybeSingle();
    if (dup) {
      return NextResponse.json({ error: "이미 사용 중인 학급코드입니다." }, { status: 409 });
    }

    const { data, error } = await supabase
      .from("classes")
      .update({ code })
      .eq("id", id)
      .eq("teacher_id", user.id)
      .select("id, code")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "학급코드 수정에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, classId: data.id, code: data.code });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

