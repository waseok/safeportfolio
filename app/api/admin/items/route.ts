import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** 교사만 호출 가능. 상점 아이템 생성 */
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
        { error: "교사만 상점 아이템을 등록할 수 있습니다." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, type, price, image_url } = body as {
      name: string;
      type: string;
      price: number;
      image_url?: string | null;
    };

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "아이템 이름을 입력해주세요." },
        { status: 400 }
      );
    }
    if (!type || typeof type !== "string" || !type.trim()) {
      return NextResponse.json(
        { error: "아이템 유형(avatar/badge 등)을 선택해주세요." },
        { status: 400 }
      );
    }
    const priceNum = typeof price === "number" ? price : parseInt(String(price), 10);
    if (!Number.isInteger(priceNum) || priceNum < 0) {
      return NextResponse.json(
        { error: "가격은 0 이상의 정수여야 합니다." },
        { status: 400 }
      );
    }

    const { data, error } = await auth
      .from("items")
      .insert({
        name: name.trim(),
        type: type.trim(),
        price: priceNum,
        image_url: image_url && String(image_url).trim() ? String(image_url).trim() : null,
        is_active: true,
      })
      .select("id, name, type, price, image_url, is_active")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || "아이템 등록에 실패했습니다." },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, item: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
