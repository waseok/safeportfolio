"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ASSIGNMENTS,
  CATEGORY_CARD_THEME,
  type Assignment,
} from "@/lib/assignments-data";

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(message)), ms);
    promise
      .then((value) => {
        clearTimeout(id);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(id);
        reject(err);
      });
  });
}

function explainUploadError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("bucket") && (lower.includes("not found") || lower.includes("does not exist"))) {
    return "Supabase Storage 버킷(cert-images)이 없습니다. Supabase Dashboard > Storage에서 cert-images 버킷을 생성해 주세요.";
  }
  if (lower.includes("row-level security") || lower.includes("permission")) {
    return "Storage 권한(RLS) 문제입니다. cert-images 버킷 정책에서 업로드 권한을 확인해 주세요.";
  }
  return message;
}

function findAssignmentByTitle(title: string | undefined): Assignment | undefined {
  if (!title?.trim()) return undefined;
  const decoded = decodeURIComponent(title.trim());
  return ASSIGNMENTS.find((a) => a.title === decoded);
}

type Props = {
  /** 과제 확인·대시보드에서 넘어온 과제 제목 */
  initialAssignmentTitle?: string;
  initialCategory?: string;
};

export function UploadForm({ initialAssignmentTitle, initialCategory }: Props) {
  const activeAssignments = useMemo(
    () => ASSIGNMENTS.filter((a) => a.status === "active"),
    [],
  );

  const initialAssignment = useMemo(() => {
    const byTitle = findAssignmentByTitle(initialAssignmentTitle);
    if (byTitle) return byTitle;
    if (initialCategory?.trim()) {
      const cat = decodeURIComponent(initialCategory.trim());
      return activeAssignments.find((a) => a.category === cat);
    }
    return undefined;
  }, [initialAssignmentTitle, initialCategory, activeAssignments]);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [assignmentId, setAssignmentId] = useState(initialAssignment?.id ?? "");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const selected = activeAssignments.find((a) => a.id === assignmentId);

  function handleFile(f: File | null) {
    setFile(f);
    if (f) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("사진을 선택해주세요.");
      return;
    }
    if (!selected) {
      setError("안전 과제를 하나 선택해주세요.");
      return;
    }
    setError(null);
    setLoading(true);
    const supabase = createClient();
    try {
      const {
        data: { user },
      } = await withTimeout(supabase.auth.getUser(), 10000, "로그인 정보를 확인하는 중 시간이 초과되었습니다.");
      if (!user) {
        setError("로그인이 필요합니다.");
        return;
      }

      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const uploadResult = await withTimeout(
        supabase.storage.from("cert-images").upload(path, file, { upsert: false }),
        20000,
        "사진 업로드가 지연되고 있습니다. 네트워크 상태를 확인 후 다시 시도해주세요.",
      );
      if (uploadResult.error) {
        setError(explainUploadError(uploadResult.error.message));
        return;
      }

      const { data: urlData } = supabase.storage.from("cert-images").getPublicUrl(path);
      const userDesc = description.trim();
      const fullDescription = userDesc
        ? `【${selected.title}】\n${userDesc}`
        : `【${selected.title}】`;

      const { error: insertError } = await supabase.from("gallery_posts").insert({
        user_id: user.id,
        image_url: urlData.publicUrl,
        category: selected.category,
        description: fullDescription,
        status: "pending",
      });
      if (insertError) {
        await supabase.storage.from("cert-images").remove([path]);
        setError(insertError.message);
        return;
      }

      router.push("/gallery");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 처리 중 알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div
        className="rounded-3xl p-6 text-center text-white shadow-xl"
        style={{ background: "linear-gradient(135deg, #29B6F6, #0288D1)" }}
      >
        <div className="text-5xl mb-2">📷</div>
        <h1 className="text-2xl font-black">⭐ 안전 활동 인증샷 올리기</h1>
        <p className="text-sky-100 text-sm mt-1 font-bold">
          오늘 실천한 안전 과제를 사진으로 남기고 포인트를 받아요!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50/50 p-5">
          <label className="block text-base font-black text-orange-800 mb-3">
            1. 📸 사진 선택
          </label>
          <label className="flex flex-col items-center justify-center gap-3 cursor-pointer">
            {preview ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md">
                <Image src={preview} alt="미리보기" fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6 text-orange-400">
                <span className="text-5xl">📷</span>
                <span className="font-semibold text-sm">여기를 눌러 사진을 선택하세요</span>
                <span className="text-xs">카메라 또는 앨범에서 고를 수 있어요</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              className="sr-only"
              required
            />
            {file && (
              <span className="rounded-full bg-orange-500 px-4 py-1.5 text-sm font-bold text-white">
                ✓ {file.name}
              </span>
            )}
          </label>
        </div>

        <div>
          <label className="block text-base font-black text-gray-800 mb-1">
            2. 📝 안전 과제 선택
          </label>
          <p className="text-sm text-slate-600 mb-3 font-medium">
            「안전 과제 확인하기」에 있는 과제와 동일한 목록이에요.
          </p>
          {activeAssignments.length === 0 ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
              지금은 진행 중인 과제가 없어요. 선생님께 문의해 주세요.
            </p>
          ) : (
            <div className="space-y-2 max-h-[min(420px,55vh)] overflow-y-auto pr-1">
              {activeAssignments.map((assignment) => {
                const theme =
                  CATEGORY_CARD_THEME[assignment.category] ?? CATEGORY_CARD_THEME["교통안전"];
                const isSelected = assignmentId === assignment.id;
                return (
                  <button
                    key={assignment.id}
                    type="button"
                    onClick={() => setAssignmentId(assignment.id)}
                    className={`w-full rounded-xl border-2 p-3.5 text-left transition ${
                      isSelected
                        ? "border-orange-500 bg-orange-50 shadow-md scale-[1.01]"
                        : "border-gray-200 bg-white hover:border-orange-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl bg-gradient-to-br ${theme.accent} text-white shadow-sm`}
                      >
                        {assignment.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-slate-900 text-sm leading-snug">
                          {assignment.title}
                        </p>
                        <span
                          className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-xs font-bold ${theme.chip}`}
                        >
                          {assignment.category}
                        </span>
                        <p className="mt-1.5 text-xs font-medium text-slate-600 line-clamp-2">
                          {assignment.description}
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-500">
                          📅 {assignment.dueDate} · ⭐ {assignment.points}P
                        </p>
                      </div>
                      {isSelected && (
                        <span className="shrink-0 text-orange-600 font-black text-lg" aria-hidden>
                          ✓
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <label className="block text-base font-black text-gray-800 mb-2">
            3. ✏️ 활동 설명 (선택)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              selected
                ? `「${selected.title}」을 어떻게 실천했는지 적어주세요.`
                : "과제를 먼저 선택한 뒤 활동 내용을 적어주세요."
            }
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none"
            rows={4}
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-700 font-medium" role="alert">
              ⚠️ {error}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !file || !assignmentId}
          className="w-full rounded-full py-4 text-lg font-black shadow-lg transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: loading ? "#9ca3af" : "linear-gradient(135deg, #FFD700, #FFC107)",
            color: loading ? "white" : "#78350f",
          }}
        >
          {loading ? "⏳ 업로드 중…" : "🚀 인증샷 올리기!"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 bg-white rounded-xl p-3 border border-gray-100">
        💡 업로드 후 선생님 확인이 있으면 피드백과 포인트를 받을 수 있어요!
      </p>
    </div>
  );
}
