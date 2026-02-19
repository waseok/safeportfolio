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
    const { postId } = body as { postId: string };
    if (!postId) {
      return NextResponse.json({ error: "postId 필요" }, { status: 400 });
    }
    const supabase = createServiceClient();

    const { data: post, error: postError } = await supabase
      .from("gallery_posts")
      .select("id, status")
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
      .update({ status: "rejected" })
      .eq("id", postId);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "서버 오류" },
      { status: 500 }
    );
  }
}
