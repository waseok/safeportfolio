import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { rowToAssignment } from "@/lib/assignments-server";
import { SAFETY_SEVEN_CATEGORIES } from "@/lib/assignments-data";

/** 교사: 안전 과제 수정 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "과제 ID가 필요합니다." }, { status: 400 });
    }

    const auth = await createClient();
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const supabase = createServiceClient();
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "teacher") {
      return NextResponse.json(
        { error: "교사만 안전 과제를 수정할 수 있습니다." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { title, description, category, emoji, dueDate, points, status } = body as {
      title?: string;
      description?: string;
      category?: string;
      emoji?: string;
      dueDate?: string;
      points?: number;
      status?: "active" | "closed";
    };

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updates.title = String(title).trim();
    if (description !== undefined) updates.description = String(description).trim();
    if (category !== undefined) {
      if (!SAFETY_SEVEN_CATEGORIES.includes(category as (typeof SAFETY_SEVEN_CATEGORIES)[number])) {
        return NextResponse.json({ error: "올바른 카테고리가 아닙니다." }, { status: 400 });
      }
      updates.category = category;
    }
    if (emoji !== undefined) updates.emoji = String(emoji).trim() || "📝";
    if (dueDate !== undefined) updates.due_date = dueDate;
    if (points !== undefined) {
      const pointsNum = typeof points === "number" ? points : parseInt(String(points), 10);
      if (!Number.isInteger(pointsNum) || pointsNum < 0) {
        return NextResponse.json({ error: "포인트는 0 이상의 정수여야 합니다." }, { status: 400 });
      }
      updates.points = pointsNum;
    }
    if (status === "active" || status === "closed") updates.status = status;

    if (Object.keys(updates).length <= 1) {
      return NextResponse.json({ error: "수정할 항목이 없습니다." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("safety_assignments")
      .update(updates)
      .eq("id", id)
      .select("id, title, description, category, emoji, due_date, points, status")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || "과제 수정에 실패했습니다." },
        { status: 500 },
      );
    }
    if (!data) {
      return NextResponse.json({ error: "해당 과제를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      assignment: rowToAssignment(data as Parameters<typeof rowToAssignment>[0]),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
