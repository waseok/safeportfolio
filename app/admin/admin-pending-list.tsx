"use client";

import { useState } from "react";
import Image from "next/image";

type Post = {
  id: string;
  image_url: string;
  category: string | null;
  description: string | null;
  status: string;
  created_at: string;
  user_name: string;
};

export function AdminPendingList({
  initialPosts,
}: {
  initialPosts: Post[];
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [selected, setSelected] = useState<Post | null>(null);
  const [feedback, setFeedback] = useState("");
  const [points, setPoints] = useState<1 | 2 | 3>(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    if (!selected) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/approve-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: selected.id,
          teacherFeedback: feedback,
          awardedPoints: points,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "승인 실패");
      setPosts((prev) => prev.filter((p) => p.id !== selected.id));
      setSelected(null);
      setFeedback("");
      setPoints(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "승인 처리 중 오류");
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (!selected) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reject-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: selected.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "반려 실패");
      setPosts((prev) => prev.filter((p) => p.id !== selected.id));
      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "반려 처리 중 오류");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {posts.length === 0 ? (
        <p className="text-slate-600">대기 중인 인증이 없습니다.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li
              key={post.id}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow transition hover:border-amber-400 hover:shadow-md"
              onClick={() => {
                setSelected(post);
                setFeedback("");
                setPoints(2);
                setError(null);
              }}
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-100">
                <Image
                  src={post.image_url}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <p className="mt-2 font-medium text-slate-800">{post.user_name}</p>
              <p className="text-sm text-slate-600">{post.category ?? "-"}</p>
              <p className="line-clamp-2 text-sm text-slate-500">
                {post.description ?? "-"}
              </p>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="modal-title" className="text-lg font-bold text-slate-800">
              피드백 및 포인트
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {selected.user_name} · {selected.category ?? "-"}
            </p>
            <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-lg bg-slate-100">
              <Image
                src={selected.image_url}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {selected.description ?? "-"}
            </p>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              칭찬 한마디
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder='예: "헬멧 끈을 꽉 조인 모습이 멋지구나!"'
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              rows={3}
            />

            <p className="mt-3 text-sm font-medium text-slate-700">
              포인트 부여 (승인 시)
            </p>
            <div className="mt-1 flex gap-2">
              {([1, 2, 3] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPoints(n)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                    points === n
                      ? "border-amber-500 bg-amber-50 text-amber-800"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {n}점{n === 1 ? " (참가상)" : n === 2 ? " (노력상)" : " (우수상)"}
                </button>
              ))}
            </div>

            {error && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 rounded-lg bg-amber-500 py-2 font-medium text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {loading ? "처리 중…" : "승인"}
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={loading}
                className="flex-1 rounded-lg border border-slate-300 py-2 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                반려
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setError(null);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-slate-600 hover:bg-slate-100"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
