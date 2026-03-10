import { createServiceClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { GalleryTabs } from "./gallery-tabs";

export default async function GalleryPage() {
  // Service client: RLS 우회 → 우리반 게시물 조회 가능
  const supabase = createServiceClient();
  const user = await getCurrentUser();
  if (!user) return null;

  // 내 게시물
  const { data: myPosts } = await supabase
    .from("gallery_posts")
    .select("id, image_url, category, description, status, teacher_feedback, awarded_points, created_at, read_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // 우리반 전체 승인된 게시물 (service client로 RLS 우회)
  let classPosts: Array<{
    id: string; image_url: string; category: string | null; description: string | null;
    created_at: string; user_name: string; awarded_points: number;
  }> = [];

  if (user.class_id) {
    const { data: classmates } = await supabase
      .from("users")
      .select("id, name")
      .eq("class_id", user.class_id);

    if (classmates && classmates.length > 0) {
      const classmateIds = classmates.map((u) => u.id);
      const { data: rawPosts } = await supabase
        .from("gallery_posts")
        .select("id, image_url, category, description, created_at, user_id, awarded_points")
        .in("user_id", classmateIds)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(60);

      const nameById = new Map(classmates.map((u) => [u.id, u.name]));
      classPosts = (rawPosts ?? []).map((p) => ({
        id: p.id,
        image_url: p.image_url,
        category: p.category,
        description: p.description,
        created_at: p.created_at,
        user_name: nameById.get(p.user_id) ?? "-",
        awarded_points: p.awarded_points ?? 0,
      }));
    }
  }

  const unreadCount = (myPosts ?? []).filter(
    (p) => p.status === "approved" && !p.read_at
  ).length;

  const approvedCount = (myPosts ?? []).filter((p) => p.status === "approved").length;
  const pendingCount = (myPosts ?? []).filter((p) => p.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">🖼️ 안전 갤러리</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            내 활동 {myPosts?.length ?? 0}건 · 승인 {approvedCount}건 · 대기 {pendingCount}건
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="rounded-full bg-orange-500 px-3 py-1 text-sm font-bold text-white animate-pulse">
              🔔 새 피드백 {unreadCount}건
            </span>
          )}
          <Link
            href="/upload"
            className="rounded-full px-4 py-2 text-sm font-bold text-white shadow-md transition hover:opacity-90"
            style={{background: "linear-gradient(135deg, #ff6b2b, #ffd700)"}}
          >
            📷 인증샷 올리기
          </Link>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 border border-emerald-200 p-4 text-center shadow-sm">
          <p className="text-2xl font-black text-emerald-600">{approvedCount}</p>
          <p className="text-xs font-semibold text-emerald-700 mt-1">✅ 승인됨</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-100 border border-amber-200 p-4 text-center shadow-sm">
          <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
          <p className="text-xs font-semibold text-amber-700 mt-1">⏳ 심사중</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-sky-100 border border-sky-200 p-4 text-center shadow-sm">
          <p className="text-2xl font-black text-sky-600">{classPosts.length}</p>
          <p className="text-xs font-semibold text-sky-700 mt-1">👥 우리반 전체</p>
        </div>
      </div>

      {/* 탭 */}
      <GalleryTabs
        myPosts={myPosts ?? []}
        classPosts={classPosts}
      />
    </div>
  );
}
