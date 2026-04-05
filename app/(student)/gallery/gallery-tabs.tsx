"use client";

import { useState } from "react";
import Image from "next/image";
import { FeedbackBubble } from "@/components/feedback/feedback-bubble";

type MyPost = {
  id: string; image_url: string; category: string | null; description: string | null;
  status: string; teacher_feedback: string | null; awarded_points: number;
  created_at: string; read_at: string | null;
};

type ClassPost = {
  id: string; image_url: string; category: string | null; description: string | null;
  created_at: string; user_name: string; awarded_points: number;
};

export function GalleryTabs({
  myPosts,
  classPosts,
}: {
  myPosts: MyPost[];
  classPosts: ClassPost[];
}) {
  const [tab, setTab] = useState<"mine" | "class">("mine");

  return (
    <div>
      {/* 탭 버튼 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("mine")}
          className={`rounded-full px-5 py-2.5 text-sm font-black transition-all shadow-sm ${
            tab === "mine"
              ? "text-gray-900 shadow-md"
              : "bg-white/70 border-2 border-sky-200 text-sky-700 hover:bg-white"
          }`}
          style={tab === "mine" ? {background: "linear-gradient(135deg, #FFD700, #FFC107)", color: "#78350f"} : undefined}
        >
          📁 내 활동 ({myPosts.length})
        </button>
        <button
          onClick={() => setTab("class")}
          className={`rounded-full px-5 py-2.5 text-sm font-black transition-all shadow-sm ${
            tab === "class"
              ? "text-white shadow-md"
              : "bg-white/70 border-2 border-sky-200 text-sky-700 hover:bg-white"
          }`}
          style={tab === "class" ? {background: "linear-gradient(135deg, #29B6F6, #0288D1)"} : undefined}
        >
          👥 우리반 갤러리 ({classPosts.length})
        </button>
      </div>

      {/* 내 활동 */}
      {tab === "mine" && (
        <>
          {myPosts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <span className="text-5xl">📭</span>
              <p className="mt-3 font-semibold">아직 올린 인증샷이 없어요</p>
              <p className="text-sm mt-1">첫 번째 안전 활동을 기록해 보세요!</p>
            </div>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2">
              {myPosts.map((post) => (
                <li
                  key={post.id}
                  id={post.status === "approved" && !post.read_at ? "unread" : undefined}
                  className="card-hover rounded-2xl border-2 bg-white shadow-sm overflow-hidden"
                  style={{borderColor: post.status === "approved" ? "#10b981" : post.status === "pending" ? "#f59e0b" : "#e5e7eb"}}
                >
                  <div className="relative aspect-video w-full bg-gray-100">
                    <Image src={post.image_url} alt="" fill className="object-cover" unoptimized />
                    <span className={`absolute right-2 top-2 rounded-full px-2.5 py-1 text-xs font-black shadow ${
                      post.status === "pending"
                        ? "bg-yellow-400 text-yellow-900"
                        : post.status === "approved"
                          ? "bg-green-400 text-green-900"
                          : "bg-gray-300 text-gray-700"
                    }`}>
                      {post.status === "pending" ? "⏳ 심사 대기" : post.status === "approved" ? "✅ 승인" : "❌ 반려"}
                    </span>
                  </div>
                  <div className="p-4">
                    <span className="inline-block rounded-full bg-orange-100 text-orange-800 text-xs font-bold px-2 py-0.5 mb-2">
                      {post.category ?? "기타"}
                    </span>
                    <p className="line-clamp-2 text-sm text-gray-700">{post.description ?? "-"}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(post.created_at).toLocaleDateString("ko-KR")}
                    </p>
                    {post.status === "approved" && (
                      <FeedbackBubble
                        feedback={post.teacher_feedback}
                        points={post.awarded_points}
                        postId={post.id}
                        readAt={post.read_at}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* 우리반 갤러리 */}
      {tab === "class" && (
        <>
          {classPosts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <span className="text-5xl">🏫</span>
              <p className="mt-3 font-semibold">우리반 승인된 활동이 아직 없어요</p>
              <p className="text-sm mt-1">첫 번째로 안전 활동을 기록해 보세요!</p>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {classPosts.map((post) => (
                <li key={post.id} className="card-hover rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="relative aspect-video w-full bg-gray-100">
                    <Image src={post.image_url} alt="" fill className="object-cover" unoptimized />
                    {post.awarded_points > 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-black text-yellow-900">
                        ⭐ {post.awarded_points}P
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-block rounded-full bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5">
                        {post.category ?? "기타"}
                      </span>
                      <span className="text-xs font-semibold text-gray-700">{post.user_name}</span>
                    </div>
                    <p className="line-clamp-2 text-xs text-gray-600 mt-1">{post.description ?? "-"}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(post.created_at).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
