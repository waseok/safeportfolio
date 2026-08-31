import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Supabase free tier pauses after ~1 week of inactivity.
// vercel.json cron calls this 3x/day (00:00, 08:00, 16:00 UTC) to keep it alive.
//
// anon 키로 핑: items는 RLS가 select 전체 허용이라 SUPABASE_SERVICE_ROLE_KEY가
// Vercel에 설정돼 있지 않아도 항상 성공한다 (서비스 롤 키 미설정이 실제
// 깨우기 실패의 원인이었음 — Supabase 로그에 최근 크론 트래픽이 전혀 없었음).
export async function GET() {
  const ts = new Date().toISOString();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error("[keepalive] NEXT_PUBLIC_SUPABASE_URL/ANON_KEY not set");
    return NextResponse.json({ ok: false, ts, error: "missing supabase env" }, { status: 500 });
  }

  try {
    const supabase = createSupabaseClient(url, anonKey, { auth: { persistSession: false } });
    const { error } = await supabase.from("items").select("id").limit(1);
    if (error) {
      console.error("[keepalive] ping failed:", error.message);
      return NextResponse.json({ ok: false, ts, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, ts });
  } catch (e) {
    console.error("[keepalive] ping threw:", e);
    return NextResponse.json({ ok: false, ts, error: String(e) }, { status: 500 });
  }
}
