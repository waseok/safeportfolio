import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** JWT payload에서 sub(user id) 추출. Auth 서버 호출 없이 처리해 멈춤 방지 */
function getUserIdFromJwt(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf-8")
    );
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

/**
 * 교사 회원가입 직후 프로필(users 테이블) 등록.
 * JWT payload에서 user id만 꺼내서 사용 (getUser 호출 제거 → Vercel에서 멈춤 방지).
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

    const userId = getUserIdFromJwt(accessToken);
    if (!userId) {
      return NextResponse.json(
        { error: "토큰이 올바르지 않습니다. 다시 가입해 주세요." },
        { status: 401 }
      );
    }

    const supabase = createServiceClient();
    const { error } = await supabase.from("users").upsert(
      {
        id: userId,
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
