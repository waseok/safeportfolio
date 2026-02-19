import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * 교사 회원가입 직후 프로필(users 테이블) 등록.
 * 쿠키 타이밍 이슈를 피하기 위해 클라이언트가 보낸 access_token으로 사용자 확인.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const accessToken =
      typeof body.accessToken === "string" ? body.accessToken.trim() : null;

    if (!accessToken) {
      return NextResponse.json(
        { error: "세션 정보가 없습니다. 다시 로그인해 주세요." },
        { status: 401 }
      );
    }
    if (!name) {
      return NextResponse.json(
        { error: "이름을 입력해주세요." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "토큰이 만료되었거나 유효하지 않습니다. 다시 가입해 주세요." },
        { status: 401 }
      );
    }

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
