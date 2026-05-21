import Image from "next/image";
import Link from "next/link";
import { CATEGORY_CARD_THEME } from "@/lib/assignments-data";
import { parseAssignmentTitle, parseUserNote } from "@/lib/gallery-post-utils";

export type MySubmissionPost = {
  id: string;
  image_url: string;
  category: string | null;
  description: string | null;
  status: string;
  awarded_points: number;
  created_at: string;
};

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  pending: { label: "⏳ 심사 대기", className: "bg-amber-100 text-amber-900 border-amber-200" },
  approved: { label: "✅ 승인", className: "bg-emerald-100 text-emerald-900 border-emerald-200" },
  rejected: { label: "❌ 반려", className: "bg-slate-100 text-slate-600 border-slate-200" },
};

export function MySubmissions({ posts }: { posts: MySubmissionPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/60 p-8 text-center">
        <p className="text-4xl mb-2">📭</p>
        <p className="font-extrabold text-slate-800">아직 올린 과제가 없어요</p>
        <p className="mt-1 text-sm font-medium text-slate-600">
          안전 과제를 실천하고 인증샷을 올려 보세요!
        </p>
        <Link
          href="/upload"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-md hover:bg-sky-700 transition"
        >
          📷 과제 올리기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {posts.map((post) => {
          const assignmentTitle =
            parseAssignmentTitle(post.description) ?? post.category ?? "안전 활동";
          const userNote = parseUserNote(post.description);
          const status = STATUS_STYLE[post.status] ?? STATUS_STYLE.pending;
          const theme =
            CATEGORY_CARD_THEME[post.category ?? ""] ?? CATEGORY_CARD_THEME["교통안전"];
          const dateStr = new Date(post.created_at).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });

          return (
            <li
              key={post.id}
              className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition"
            >
              <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                <Image
                  src={post.image_url}
                  alt={assignmentTitle}
                  fill
                  className="object-cover"
                  sizes="72px"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1 py-0.5">
                <p className="font-extrabold text-slate-900 text-[15px] leading-snug line-clamp-2">
                  {assignmentTitle}
                </p>
                {post.category && (
                  <span
                    className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[11px] font-bold ${theme.chip}`}
                  >
                    {post.category}
                  </span>
                )}
                {userNote && (
                  <p className="mt-1 text-xs font-medium text-slate-600 line-clamp-1">
                    {userNote}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-extrabold ${status.className}`}
                  >
                    {status.label}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">{dateStr}</span>
                  {post.status === "approved" && post.awarded_points > 0 && (
                    <span className="text-[11px] font-extrabold text-amber-700">
                      ⭐ {post.awarded_points}P
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-center">
        <Link
          href="/gallery"
          className="text-sm font-bold text-sky-700 hover:text-sky-900 underline-offset-2 hover:underline"
        >
          갤러리에서 자세히 보기 →
        </Link>
      </p>
    </div>
  );
}
