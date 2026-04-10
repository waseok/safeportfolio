import { createServiceClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { GalleryTabs } from "./gallery-tabs";

export default async function GalleryPage() {
  const supabase = createServiceClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: myPosts } = await supabase
    .from("gallery_posts")
    .select("id, image_url, category, description, status, teacher_feedback, awarded_points, created_at, read_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // 학급 구분 없이 전체 승인된 게시물을 통합 조회 (메인 갤러리)
  const { data: rawAllPosts } = await supabase
    .from("gallery_posts")
    .select("id, image_url, category, description, created_at, user_id, awarded_points")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(60);

  const postUserIds = [...new Set((rawAllPosts ?? []).map((p) => p.user_id).filter(Boolean))] as string[];
  const { data: userRows } = postUserIds.length > 0
    ? await supabase.from("users").select("id, name").in("id", postUserIds)
    : { data: [] };

  const nameById = new Map((userRows ?? []).map((u: {id: string; name: string}) => [u.id, u.name]));

  const allApprovedPosts = (rawAllPosts ?? []).map((p) => ({
    id: p.id,
    image_url: p.image_url,
    category: p.category,
    description: p.description,
    created_at: p.created_at,
    user_name: nameById.get(p.user_id) ?? "-",
    awarded_points: p.awarded_points ?? 0,
  }));

  const unreadCount = (myPosts ?? []).filter(
    (p) => p.status === "approved" && !p.read_at
  ).length;

  const approvedCount = (myPosts ?? []).filter((p) => p.status === "approved").length;
  const pendingCount = (myPosts ?? []).filter((p) => p.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">안전 갤러리</h1>
          <p className="text-sm text-slate-500 mt-1">
            내 활동 {myPosts?.length ?? 0}건 · 승인 {approvedCount}건 · 대기 {pendingCount}건
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="rounded-full bg-orange-500 px-3 py-1 text-sm font-bold text-white animate-pulse">
              새 피드백 {unreadCount}건
            </span>
          )}
          <Link
            href="/upload"
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700"
          >
            📷 인증샷 올리기
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white border border-emerald-200 p-4 text-center shadow-sm">
          <p className="text-2xl font-extrabold text-emerald-600">{approvedCount}</p>
          <p className="text-xs font-medium text-emerald-700 mt-1">승인됨</p>
        </div>
        <div className="rounded-xl bg-white border border-amber-200 p-4 text-center shadow-sm">
          <p className="text-2xl font-extrabold text-amber-600">{pendingCount}</p>
          <p className="text-xs font-medium text-amber-700 mt-1">심사중</p>
        </div>
        <div className="rounded-xl bg-white border border-sky-200 p-4 text-center shadow-sm">
          <p className="text-2xl font-extrabold text-sky-600">{allApprovedPosts.length}</p>
          <p className="text-xs font-medium text-sky-700 mt-1">전체 갤러리</p>
        </div>
      </div>

      <GalleryTabs
        myPosts={myPosts ?? []}
        classPosts={allApprovedPosts}
      />
    </div>
  );
}
