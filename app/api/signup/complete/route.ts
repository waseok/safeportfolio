import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * 교사 회원가입 후 프로필(users 테이블)을 서버에서 등록합니다.
 * 클라이언트 RLS/세션 타이밍 이슈를 피하기 위해 Service Role로 insert.
 */
export async function POST(request: Request) {
  try {
    const auth = await createClient();
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "로그인된 사용자만 호출할 수 있습니다." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json(
        { error: "이름을 입력해주세요." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { error } = await supabase.from("users").upsert(
      {
        id: user.id,
        role: "teacher",
        name,
      },
      { onConflict: "id" }
    );

    if (error) {
      return NextResponse.json(
        { error: error.message || "프로필 저장에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
