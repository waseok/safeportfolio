"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

const CATEGORIES = [
  { label: "생활안전", emoji: "🏠" },
  { label: "교통안전", emoji: "🚦" },
  { label: "폭력예방·신변보호", emoji: "🤝" },
  { label: "약물·사이버중독예방", emoji: "💻" },
  { label: "재난안전", emoji: "🌊" },
  { label: "직업안전", emoji: "⚙️" },
  { label: "응급처치", emoji: "🏥" },
];

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(message)), ms);
    promise.then((value) => { clearTimeout(id); resolve(value); })
      .catch((err) => { clearTimeout(id); reject(err); });
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

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleFile(f: File | null) {
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("사진을 선택해주세요."); return; }
    setError(null);
    setLoading(true);
    const supabase = createClient();
    try {
      const { data: { user } } = await withTimeout(supabase.auth.getUser(), 10000, "로그인 정보를 확인하는 중 시간이 초과되었습니다.");
      if (!user) { setError("로그인이 필요합니다."); return; }

      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const uploadResult = await withTimeout(
        supabase.storage.from("cert-images").upload(path, file, { upsert: false }),
        20000,
        "사진 업로드가 지연되고 있습니다. 네트워크 상태를 확인 후 다시 시도해주세요."
      );
      if (uploadResult.error) { setError(explainUploadError(uploadResult.error.message)); return; }

      const { data: urlData } = supabase.storage.from("cert-images").getPublicUrl(path);
      const { error: insertError } = await supabase.from("gallery_posts").insert({
        user_id: user.id,
        image_url: urlData.publicUrl,
        category: category || null,
        description: description.trim() || null,
        status: "pending",
      });
      if (insertError) { setError(insertError.message); return; }

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
      {/* 헤더 */}
      <div className="rounded-2xl p-5 text-white shadow-lg"
        style={{background: "linear-gradient(135deg, #ff6b2b, #ffd700)"}}>
        <h1 className="text-2xl font-black">📷 안전 활동 인증샷 올리기</h1>
        <p className="text-orange-100 text-sm mt-1">
          오늘 실천한 안전 활동을 사진으로 남기고 포인트를 받아요!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 사진 업로드 */}
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

        {/* 카테고리 */}
        <div>
          <label className="block text-base font-black text-gray-800 mb-3">
            2. 🗂️ 안전 주제 선택
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => setCategory(c.label)}
                className={`rounded-xl border-2 px-3 py-2.5 text-sm font-bold text-left transition ${
                  category === c.label
                    ? "border-orange-500 bg-orange-50 text-orange-800 scale-105 shadow-sm"
                    : "border-gray-200 text-gray-600 hover:border-orange-300"
                }`}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* 설명 */}
        <div>
          <label className="block text-base font-black text-gray-800 mb-2">
            3. ✏️ 활동 설명
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="어떤 안전 활동을 했는지 적어주세요. 예: 오늘 자전거를 탈 때 헬멧을 꼭 쓰고 탔어요!"
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none"
            rows={4}
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-700 font-medium" role="alert">⚠️ {error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full rounded-2xl py-4 text-lg font-black text-white shadow-lg transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{background: loading ? "#9ca3af" : "linear-gradient(135deg, #ff6b2b, #ffd700)"}}
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
