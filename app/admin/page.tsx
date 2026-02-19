import { createClient } from "@/lib/supabase/server";
import { AdminPendingList } from "./admin-pending-list";
import Link from "next/link";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: pendingPosts } = await supabase
    .from("gallery_posts")
    .select("id, image_url, category, description, status, created_at, user_id")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const userIds = [
    ...new Set(
      (pendingPosts ?? [])
        .map((p: { user_id?: string }) => p.user_id)
        .filter(Boolean)
    ),
  ] as string[];
  const { data: userRows } = await supabase
    .from("users")
    .select("id, name")
    .in("id", userIds);
  const nameById = new Map(
    (userRows ?? []).map((u: { id: string; name: string }) => [u.id, u.name])
  );

  type PostRow = { id: string; image_url: string; category: string | null; description: string | null; status: string; created_at: string; user_id: string };
  type Post = { id: string; image_url: string; category: string | null; description: string | null; status: string; created_at: string; user_name: string };
  const posts: Post[] = (pendingPosts ?? []).map((p: PostRow) => ({
    id: p.id,
    image_url: p.image_url,
    category: p.category,
    description: p.description,
    status: p.status,
    created_at: p.created_at,
    user_name: nameById.get(p.user_id) ?? "-",
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">인증 대기 목록</h1>
        <Link
          href="/admin/classes"
          className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
        >
          학급 코드 관리
        </Link>
      </div>
      <AdminPendingList initialPosts={posts} />
    </div>
  );
}
