"use client";

import { useState } from "react";
import Image from "next/image";

type Post = {
  id: string;
  image_url: string;
  category: string | null;
  description: string | null;
  status: string;
  teacher_feedback: string | null;
  awarded_points: number;
  created_at: string;
  user_name: string;
};

type Tab = "pending" | "approved" | "all" | "rejected";

export function AdminAllPostsTabs({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [tab, setTab] = useState<Tab>("pending");
  const [selected, setSelected] = useState<Post | null>(null);
  const [feedback, setFeedback] = useState("");
  const [points, setPoints] = useState<1 | 2 | 3>(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = posts.filter((p) =>
    tab === "all" ? true : p.status === tab
  );

  async function handleApprove() {
    if (!selected) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/approve-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: selected.id, teacherFeedback: feedback, awardedPoints: points }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "승인 실패");
      setPosts((prev) =>
        prev.map((p) =>
          p.id === selected.id
            ? { ...p, status: "approved", teacher_feedback: feedback, awarded_points: points }
            : p
        )
      );
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
      setPosts((prev) =>
        prev.map((p) => (p.id === selected.id ? { ...p, status: "rejected" } : p))
      );
      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "반려 처리 중 오류");
    } finally {
      setLoading(false);
    }
  }

  const tabList: { key: Tab; label: string; color: string }[] = [
    { key: "pending", label: "⏳ 대기중", color: "bg-yellow-500 text-white" },
    { key: "approved", label: "✅ 승인됨", color: "bg-green-500 text-white" },
    { key: "rejected", label: "❌ 반려됨", color: "bg-red-400 text-white" },
    { key: "all", label: "📋 전체", color: "bg-blue-500 text-white" },
  ];

  return (
    <>
      {/* 탭 */}
      <div className="flex gap-2 flex-wrap">
        {tabList.map((t) => {
          const count = t.key === "all" ? posts.length : posts.filter((p) => p.status === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-4 py-2 text-sm font-black transition-all shadow-sm ${
                tab === t.key
                  ? t.color + " scale-105 shadow-md"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {/* 게시물 목록 */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <span className="text-5xl">📭</span>
          <p className="mt-3 font-semibold">이 탭에 게시물이 없습니다.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <li
              key={post.id}
              className={`card-hover cursor-pointer rounded-2xl border-2 bg-white shadow-sm overflow-hidden transition ${
                post.status === "pending"
                  ? "border-yellow-300 hover:border-yellow-500"
                  : post.status === "approved"
                    ? "border-green-300 hover:border-green-500"
                    : "border-red-200 hover:border-red-400"
              }`}
              onClick={() => {
                if (post.status === "pending") {
                  setSelected(post);
                  setFeedback("");
                  setPoints(2);
                  setError(null);
                }
              }}
            >
              <div className="relative aspect-video w-full bg-gray-100">
                <Image src={post.image_url} alt="" fill className="object-cover" unoptimized />
                <span className={`absolute right-2 top-2 rounded-full px-2.5 py-1 text-xs font-black shadow ${
                  post.status === "pending"
                    ? "bg-yellow-400 text-yellow-900"
                    : post.status === "approved"
                      ? "bg-green-400 text-green-900"
                      : "bg-red-300 text-red-900"
                }`}>
                  {post.status === "pending" ? "⏳ 대기" : post.status === "approved" ? "✅ 승인" : "❌ 반려"}
                </span>
                {post.status === "approved" && post.awarded_points > 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-black text-yellow-900">
                    ⭐ {post.awarded_points}P
                  </span>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-800">{post.user_name}</span>
                  <span className="rounded-full bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5">
                    {post.category ?? "기타"}
                  </span>
                </div>
                <p className="line-clamp-2 text-xs text-gray-500 mt-1">{post.description ?? "-"}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(post.created_at).toLocaleDateString("ko-KR")}
                </p>
                {post.status === "approved" && post.teacher_feedback && (
                  <p className="mt-1 text-xs text-green-700 bg-green-50 rounded-lg px-2 py-1">
                    💬 {post.teacher_feedback}
                  </p>
                )}
                {post.status === "pending" && (
                  <p className="mt-2 text-xs text-yellow-700 font-semibold">👆 클릭하여 승인/반려</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 승인/반려 모달 */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={() => { setSelected(null); setError(null); }}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="modal-title" className="text-xl font-black text-gray-900 mb-1">
              📝 인증 심사
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {selected.user_name} · {selected.category ?? "-"}
            </p>

            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
              <Image src={selected.image_url} alt="" fill className="object-cover" unoptimized />
            </div>
            <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{selected.description ?? "-"}</p>

            <label className="mt-4 block text-sm font-bold text-gray-700">
              ✏️ 칭찬 한마디 (학생에게 전달돼요)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder='예: "헬멧 끈을 꽉 조인 모습이 정말 멋지구나!"'
              className="mt-1 w-full rounded-xl border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
              rows={3}
            />

            <p className="mt-3 text-sm font-bold text-gray-700">⭐ 포인트 (승인 시)</p>
            <div className="mt-1 flex gap-2">
              {([1, 2, 3] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPoints(n)}
                  className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-black transition ${
                    points === n
                      ? "border-orange-500 bg-orange-50 text-orange-800 scale-105"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {n}P {n === 1 ? "🥉참가" : n === 2 ? "🥈노력" : "🥇우수"}
                </button>
              ))}
            </div>

            {error && (
              <p className="mt-2 rounded-lg bg-red-50 p-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 rounded-xl py-3 font-black text-white transition hover:opacity-90 disabled:opacity-50"
                style={{background: "linear-gradient(135deg, #10b981, #059669)"}}
              >
                {loading ? "처리 중…" : "✅ 승인"}
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={loading}
                className="flex-1 rounded-xl border-2 border-red-300 py-3 font-black text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                ❌ 반려
              </button>
              <button
                type="button"
                onClick={() => { setSelected(null); setError(null); }}
                className="rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-500 hover:bg-gray-50"
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
