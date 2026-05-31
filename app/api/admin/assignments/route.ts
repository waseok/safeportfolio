import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  countSubmissionsByAssignmentTitle,
  fetchAssignments,
  rowToAssignment,
} from "@/lib/assignments-server";
import { SAFETY_SEVEN_CATEGORIES } from "@/lib/assignments-data";

async function requireTeacher() {
  const auth = await createClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }) };
  }
  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "teacher") {
    return {
      error: NextResponse.json(
        { error: "교사만 안전 과제를 관리할 수 있습니다." },
        { status: 403 },
      ),
    };
  }
  return { supabase };
}

/** 교사: 과제 목록 (제출 수 포함) */
export async function GET() {
  try {
    const authResult = await requireTeacher();
    if ("error" in authResult && authResult.error) return authResult.error;
    const { supabase } = authResult as { supabase: ReturnType<typeof createServiceClient> };

    const list = await fetchAssignments(supabase);
    const withCounts = await countSubmissionsByAssignmentTitle(supabase, list);
    return NextResponse.json({ assignments: withCounts });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

/** 교사: 새 과제 등록 */
export async function POST(request: Request) {
  try {
    const authResult = await requireTeacher();
    if ("error" in authResult && authResult.error) return authResult.error;
    const { supabase } = authResult as { supabase: ReturnType<typeof createServiceClient> };

    const body = await request.json();
    const { title, description, category, emoji, dueDate, points } = body as {
      title: string;
      description: string;
      category: string;
      emoji?: string;
      dueDate: string;
      points?: number;
    };

    if (!title?.trim() || !description?.trim() || !dueDate) {
      return NextResponse.json({ error: "제목, 설명, 마감일은 필수입니다." }, { status: 400 });
    }
    if (!SAFETY_SEVEN_CATEGORIES.includes(category as (typeof SAFETY_SEVEN_CATEGORIES)[number])) {
      return NextResponse.json({ error: "올바른 7대 안전 카테고리를 선택해주세요." }, { status: 400 });
    }

    const pointsNum = typeof points === "number" ? points : parseInt(String(points), 10);
    if (!Number.isInteger(pointsNum) || pointsNum < 0) {
      return NextResponse.json({ error: "포인트는 0 이상의 정수여야 합니다." }, { status: 400 });
    }

    const { data: lastRow } = await supabase
      .from("safety_assignments")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextSortOrder = Math.min((lastRow?.sort_order ?? 0) + 1, 2147483647);

    const id = `assign-${Date.now()}`;
    const { data, error } = await supabase
      .from("safety_assignments")
      .insert({
        id,
        title: title.trim(),
        description: description.trim(),
        category,
        emoji: emoji?.trim() || "📝",
        due_date: dueDate,
        points: pointsNum,
        status: "active",
        sort_order: nextSortOrder,
      })
      .select("id, title, description, category, emoji, due_date, points, status")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || "과제 등록에 실패했습니다. safety_assignments 테이블을 확인해주세요." },
        { status: 500 },
      );
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
