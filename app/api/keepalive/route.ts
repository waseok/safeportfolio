import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Supabase free tier pauses after inactivity.
// Vercel cron (vercel.json) calls this daily to keep it alive.
export async function GET() {
  try {
    const supabase = await createClient();
    await supabase.from("items").select("id").limit(1);
    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
