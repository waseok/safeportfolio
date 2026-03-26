import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const auth = await createClient();
    const { data: { user } } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    // RLS 재귀 충돌 방지: 역할 확인은 서비스 클라이언트로
    const supabase = createServiceClient();
    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (profile?.role !== "teacher") return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

    const body = await request.json();
    const { postId, teacherFeedback, awardedPoints } = body as {
      postId: string;
      teacherFeedback: string;
      awardedPoints: number;
    };
    if (
      !postId ||
      typeof teacherFeedback !== "string" ||
      !Number.isInteger(awardedPoints) ||
      awardedPoints < 1 ||
      awardedPoints > 3
    ) {
      return NextResponse.json(
        { error: "postId, teacherFeedback(문자열), awardedPoints(1~3) 필요" },
        { status: 400 }
      );
    }

    const { data: post, error: postError } = await supabase
      .from("gallery_posts")
      .select("id, user_id, status")
      .eq("id", postId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: "게시글을 찾을 수 없음" }, { status: 404 });
    }
    if (post.status !== "pending") {
      return NextResponse.json({ error: "이미 처리된 게시글입니다" }, { status: 400 });
    }

    // 게시글 승인 처리
    const { error: updatePostError } = await supabase
      .from("gallery_posts")
      .update({
        status: "approved",
        teacher_feedback: teacherFeedback,
        awarded_points: awardedPoints,
      })
      .eq("id", postId);

    if (updatePostError) {
      return NextResponse.json({ error: "게시글 승인 처리에 실패했습니다." }, { status: 500 });
    }

    // 포인트 지급 (실패해도 승인 자체는 유효)
    const { data: userRow } = await supabase
      .from("users")
      .select("current_points, total_points")
      .eq("id", post.user_id)
      .single();

    if (userRow) {
      const { error: updatePointsError } = await supabase
        .from("users")
        .update({
          current_points: userRow.current_points + awardedPoints,
          total_points: userRow.total_points + awardedPoints,
        })
        .eq("id", post.user_id);

      if (updatePointsError) {
        // 승인은 완료됐으나 포인트 지급 실패 - 로그 기록 후 경고 포함 응답
        console.error("[approve-post] 포인트 지급 실패:", updatePointsError.message, "userId:", post.user_id);
        return NextResponse.json({ ok: true, pointsWarning: "승인은 완료됐으나 포인트 지급에 실패했습니다. 학생 관리에서 직접 지급해주세요." });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "서버 오류" },
      { status: 500 }
    );
  }
}
