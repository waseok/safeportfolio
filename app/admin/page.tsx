import { createServiceClient } from "@/lib/supabase/server";
import { AdminAllPostsTabs } from "./admin-all-posts-tabs";

export default async function AdminPage() {
  const supabase = createServiceClient();

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
    <div className="space-y-8">
      {/* 헤더 카드 */}
      <div>
        <h1 className="text-[1.75rem] font-extrabold text-slate-800 tracking-tight">과제 인증 관리</h1>
        <p className="text-base text-slate-600 mt-1">학생들이 올린 안전 활동 인증샷을 확인하고 승인·반려하세요.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">대기중</p>
          <p className="mt-1 text-3xl font-extrabold text-amber-500">{pendingCount}</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">승인됨</p>
          <p className="mt-1 text-3xl font-extrabold text-emerald-500">{approvedCount}</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">반려됨</p>
          <p className="mt-1 text-3xl font-extrabold text-red-400">{rejectedCount}</p>
        </div>
      </div>

      <AdminAllPostsTabs initialPosts={posts} />
    </div>
  );
}
