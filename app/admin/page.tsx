import { createClient } from "@/lib/supabase/server";
import { AdminAllPostsTabs } from "./admin-all-posts-tabs";

export default async function AdminPage() {
  const supabase = await createClient();

  // 모든 게시물 가져오기 (pending + approved + rejected)
  const { data: allPosts } = await supabase
    .from("gallery_posts")
    .select("id, image_url, category, description, status, teacher_feedback, awarded_points, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(200);

  const userIds = [...new Set((allPosts ?? []).map((p: {user_id?: string}) => p.user_id).filter(Boolean))] as string[];
  const { data: userRows } = await supabase
    .from("users")
    .select("id, name")
    .in("id", userIds);

  const nameById = new Map((userRows ?? []).map((u: {id: string; name: string}) => [u.id, u.name]));

  type PostRow = {
    id: string; image_url: string; category: string | null; description: string | null;
    status: string; teacher_feedback: string | null; awarded_points: number; created_at: string; user_id: string;
  };

  const posts = (allPosts ?? []).map((p: PostRow) => ({
    id: p.id,
    image_url: p.image_url,
    category: p.category,
    description: p.description,
    status: p.status,
    teacher_feedback: p.teacher_feedback,
    awarded_points: p.awarded_points,
    created_at: p.created_at,
    user_name: nameById.get(p.user_id) ?? "-",
  }));

  const pendingCount = posts.filter((p) => p.status === "pending").length;
  const approvedCount = posts.filter((p) => p.status === "approved").length;
  const rejectedCount = posts.filter((p) => p.status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="rounded-2xl p-5 text-white shadow-lg"
        style={{background: "linear-gradient(135deg, #1e3a5f, #2563eb)"}}>
        <h1 className="text-2xl font-black">📋 안전 활동 인증 관리</h1>
        <p className="text-blue-200 text-sm mt-1">학생들이 올린 안전 활동 인증샷을 확인하고 승인/반려하세요.</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/15 p-3 text-center border border-white/20">
            <p className="text-2xl font-black text-yellow-300">{pendingCount}</p>
            <p className="text-xs text-blue-200 mt-0.5">⏳ 대기중</p>
          </div>
          <div className="rounded-xl bg-white/15 p-3 text-center border border-white/20">
            <p className="text-2xl font-black text-green-300">{approvedCount}</p>
            <p className="text-xs text-blue-200 mt-0.5">✅ 승인됨</p>
          </div>
          <div className="rounded-xl bg-white/15 p-3 text-center border border-white/20">
            <p className="text-2xl font-black text-red-300">{rejectedCount}</p>
            <p className="text-xs text-blue-200 mt-0.5">❌ 반려됨</p>
          </div>
        </div>
      </div>

      <AdminAllPostsTabs initialPosts={posts} />
    </div>
  );
}
