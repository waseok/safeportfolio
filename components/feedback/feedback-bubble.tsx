"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  feedback: string | null;
  points: number;
  postId: string;
  readAt: string | null;
};

export function FeedbackBubble({ feedback, points, postId, readAt }: Props) {
  const [read, setRead] = useState(!!readAt);

  async function markRead() {
    if (read) return;
    const supabase = createClient();
    await supabase
      .from("gallery_posts")
      .update({ read_at: new Date().toISOString() })
      .eq("id", postId);
    setRead(true);
  }

  return (
    <div
      className="mt-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3"
      role="region"
      aria-label="선생님 피드백"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden>
          👩‍🏫
        </span>
        <span className="text-sm font-medium text-amber-900">
          선생님 칭찬 한마디
        </span>
        {!read && (
          <button
            type="button"
            onClick={markRead}
            className="ml-auto text-xs text-amber-600 underline"
          >
            확인함
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-amber-800">
        &ldquo;{feedback ?? "잘했어요!"}&rdquo;
      </p>
      <p className="mt-1 text-xs font-medium text-amber-600">
        +{points} 포인트 획득
      </p>
    </div>
  );
}
