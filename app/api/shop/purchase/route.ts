import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabaseAuth = await createClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const body = await request.json();
    const { itemId } = body as { itemId: string };
    if (!itemId) {
      return NextResponse.json({ error: "itemId 필요" }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data: item, error: itemError } = await supabase
      .from("items")
      .select("id, price, name")
      .eq("id", itemId)
      .eq("is_active", true)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: "판매 중인 아이템을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const { data: userRow, error: userError } = await supabase
      .from("users")
      .select("current_points")
      .eq("id", user.id)
      .single();

    if (userError || !userRow) {
      return NextResponse.json({ error: "사용자 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    if (userRow.current_points < item.price) {
      return NextResponse.json(
        { error: "포인트가 부족합니다." },
        { status: 400 }
      );
    }

    const newPoints = userRow.current_points - item.price;
    const { data: updated, error: updateError } = await supabase
      .from("users")
      .update({ current_points: newPoints })
      .eq("id", user.id)
      .gte("current_points", item.price)
      .select("current_points")
      .single();

    if (updateError || !updated || updated.current_points !== newPoints) {
      return NextResponse.json(
        { error: "포인트가 부족하거나 이미 사용되었습니다." },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabase.from("user_inventory").insert({
      user_id: user.id,
      item_id: item.id,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        await supabase
          .from("users")
          .update({ current_points: userRow.current_points })
          .eq("id", user.id);
        return NextResponse.json(
          { error: "이미 보유한 아이템입니다." },
          { status: 400 }
        );
      }
      await supabase
        .from("users")
        .update({ current_points: userRow.current_points })
        .eq("id", user.id);
      return NextResponse.json(
        { error: "구매 처리 중 오류가 났습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      newPoints: newPoints,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "서버 오류" },
      { status: 500 }
    );
  }
}
