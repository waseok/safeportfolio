import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { FeedbackBubble } from "@/components/feedback/feedback-bubble";

export default async function GalleryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: posts } = await supabase
    .from("gallery_posts")
    .select("id, image_url, category, description, status, teacher_feedback, awarded_points, created_at, read_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const unreadCount = (posts ?? []).filter(
    (p) => p.status === "approved" && !p.read_at
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-900">내 갤러리</h1>
        {unreadCount > 0 && (
          <Link
            href="/gallery#unread"
            className="rounded-full bg-amber-500 px-3 py-1 text-sm font-medium text-white"
          >
            선생님이 피드백을 남겼어요! (+{unreadCount}건)
          </Link>
        )}
        <Link
          href="/upload"
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
        >
          업로드
        </Link>
      </div>

      {!posts?.length ? (
        <p className="text-amber-800/80">아직 올린 인증샷이 없어요.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <li
              key={post.id}
              id={post.status === "approved" && !post.read_at ? "unread" : undefined}
              className="rounded-2xl border border-amber-200 bg-white p-4 shadow"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-amber-100">
                <Image
                  src={post.image_url}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
                <span
                  className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                    post.status === "pending"
                      ? "bg-amber-200 text-amber-900"
                      : post.status === "approved"
                        ? "bg-green-200 text-green-900"
                        : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {post.status === "pending"
                    ? "심사 대기"
                    : post.status === "approved"
                      ? "승인"
                      : "반려"}
                </span>
              </div>
              <p className="mt-2 text-sm text-amber-800">{post.category ?? "-"}</p>
              <p className="line-clamp-2 text-sm text-amber-700/90">
                {post.description ?? "-"}
              </p>
              {post.status === "approved" && (
                <FeedbackBubble
                  feedback={post.teacher_feedback}
                  points={post.awarded_points}
                  postId={post.id}
                  readAt={post.read_at}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
