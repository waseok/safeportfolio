import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const auth = await createClient();
    const { data: { user } } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    const { data: profile } = await auth.from("users").select("role").eq("id", user.id).single();
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
    const supabase = createServiceClient();

    const { data: post, error: postError } = await supabase
      .from("gallery_posts")
      .select("id, user_id, status")
      .eq("id", postId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: "게시글을 찾을 수 없음" }, { status: 404 });
    }
    if (post.status !== "pending") {
      return NextResponse.json(
        { error: "이미 처리된 게시글입니다" },
        { status: 400 }
      );
    }

    await supabase
      .from("gallery_posts")
      .update({
        status: "approved",
        teacher_feedback: teacherFeedback,
        awarded_points: awardedPoints,
      })
      .eq("id", postId);

    const { data: userRow } = await supabase
      .from("users")
      .select("current_points, total_points")
      .eq("id", post.user_id)
      .single();

    if (userRow) {
      await supabase
        .from("users")
        .update({
          current_points: userRow.current_points + awardedPoints,
          total_points: userRow.total_points + awardedPoints,
        })
        .eq("id", post.user_id);
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
