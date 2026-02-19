import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** 교사만 호출 가능. 상점 아이템 수정(이름, 유형, 가격, 이미지, 노출 여부) */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "아이템 ID가 필요합니다." }, { status: 400 });
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
      return NextResponse.json(
        { error: "교사만 상점 아이템을 수정할 수 있습니다." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, type, price, image_url, is_active } = body as {
      name?: string;
      type?: string;
      price?: number;
      image_url?: string | null;
      is_active?: boolean;
    };

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = typeof name === "string" ? name.trim() : name;
    if (type !== undefined) updates.type = typeof type === "string" ? type.trim() : type;
    if (price !== undefined) {
      const priceNum = typeof price === "number" ? price : parseInt(String(price), 10);
      if (!Number.isInteger(priceNum) || priceNum < 0) {
        return NextResponse.json(
          { error: "가격은 0 이상의 정수여야 합니다." },
          { status: 400 }
        );
      }
      updates.price = priceNum;
    }
    if (image_url !== undefined) {
      updates.image_url = image_url && String(image_url).trim() ? String(image_url).trim() : null;
    }
    if (typeof is_active === "boolean") updates.is_active = is_active;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "수정할 항목이 없습니다." }, { status: 400 });
    }

    const { data, error } = await auth
      .from("items")
      .update(updates)
      .eq("id", id)
      .select("id, name, type, price, image_url, is_active")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || "아이템 수정에 실패했습니다." },
        { status: 500 }
      );
    }
    if (!data) {
      return NextResponse.json({ error: "해당 아이템을 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, item: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
