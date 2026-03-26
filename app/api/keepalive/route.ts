import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Supabase free tier pauses after ~1 week of inactivity.
// vercel.json cron calls this 3x/day (00:00, 08:00, 16:00 UTC) to keep it alive.
export async function GET() {
  const ts = new Date().toISOString();
  try {
    const supabase = createServiceClient();
    // ping 여러 테이블을 동시에 조회해 DB 활성 상태 유지
    const [r1, r2] = await Promise.all([
      supabase.from("items").select("id").limit(1),
      supabase.from("users").select("id").limit(1),
    ]);
    const ok = !r1.error && !r2.error;
    return NextResponse.json({ ok, ts, pings: 2 });
  } catch (e) {
    return NextResponse.json({ ok: false, ts, error: String(e) }, { status: 500 });
  }
}
