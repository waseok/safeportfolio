/**
 * 진단 API: /api/debug
 * 환경변수·DB 연결·RLS 정책을 단계별로 점검합니다.
 * 브라우저에서 /api/debug 를 열면 JSON 결과를 볼 수 있습니다.
 */
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const results: Record<string, unknown> = {};

  // 1. 환경변수 확인
  results.env = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  const missingEnv = Object.entries(results.env as Record<string, boolean>)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missingEnv.length > 0) {
    return NextResponse.json({
      ok: false,
      step: "env",
      error: `환경변수 누락: ${missingEnv.join(", ")}`,
      results,
    });
  }

  // 2. 서비스 클라이언트 DB 연결 확인
  try {
    const supabase = createServiceClient();

    // users 테이블 접근 테스트
    const { error: usersErr } = await Promise.race([
      supabase.from("users").select("id").limit(1),
      new Promise<{ error: { message: string } }>((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT after 5s")), 5000)
      ),
    ]);
    results.users_table = usersErr ? `ERROR: ${usersErr.message}` : "OK";

    // gallery_posts 테이블 접근 테스트
    const { error: galleryErr } = await Promise.race([
      supabase.from("gallery_posts").select("id").limit(1),
      new Promise<{ error: { message: string } }>((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT after 5s")), 5000)
      ),
    ]);
    results.gallery_posts_table = galleryErr ? `ERROR: ${galleryErr.message}` : "OK";

    // classes 테이블 접근 테스트
    const { error: classesErr } = await Promise.race([
      supabase.from("classes").select("id").limit(1),
      new Promise<{ error: { message: string } }>((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT after 5s")), 5000)
      ),
    ]);
    results.classes_table = classesErr ? `ERROR: ${classesErr.message}` : "OK";

    // items 테이블 접근 테스트
    const { error: itemsErr } = await Promise.race([
      supabase.from("items").select("id").limit(1),
      new Promise<{ error: { message: string } }>((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT after 5s")), 5000)
      ),
    ]);
    results.items_table = itemsErr ? `ERROR: ${itemsErr.message}` : "OK";

    // get_my_role 함수 존재 여부 확인
    const { error: fnErr } = await supabase.rpc("get_my_role");
    results.get_my_role_function = fnErr
      ? `MISSING or ERROR: ${fnErr.message} — schema.sql을 다시 실행하세요`
      : "OK";

  } catch (e) {
    results.db_connection = `FAILED: ${e instanceof Error ? e.message : String(e)}`;
    return NextResponse.json({ ok: false, step: "db", results });
  }

  const hasError = Object.values(results).some(
    (v) => typeof v === "string" && v.startsWith("ERROR")
  );

  return NextResponse.json({
    ok: !hasError,
    ts: new Date().toISOString(),
    results,
    instruction: hasError
      ? "supabase/schema.sql을 Supabase SQL Editor에서 전체 실행하세요."
      : "모든 점검 통과 ✅",
  });
}
