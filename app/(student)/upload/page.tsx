"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "생활안전",
  "교통안전",
  "폭력예방·신변보호",
  "약물·사이버중독예방",
  "재난안전",
  "직업안전",
  "응급처치",
];

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("사진을 선택해주세요.");
      return;
    }
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("cert-images")
      .upload(path, file, { upsert: false });
    if (uploadError) {
      setError(uploadError.message);
      setLoading(false);
      return;
    }
    const { data: urlData } = supabase.storage
      .from("cert-images")
      .getPublicUrl(path);
    const imageUrl = urlData.publicUrl;

    const { error: insertError } = await supabase.from("gallery_posts").insert({
      user_id: user.id,
      image_url: imageUrl,
      category: category || null,
      description: description.trim() || null,
      status: "pending",
    });
    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }
    router.push("/gallery");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-3xl font-bold text-amber-900">인증샷 업로드</h1>
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border-2 border-amber-200 bg-white p-6 shadow-lg"
      >
        <label className="block text-base font-semibold text-amber-800">
          사진 선택
        </label>
        <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600">
            <span className="text-lg" aria-hidden>
              📷
            </span>
            <span className="font-medium">카메라/앨범에서 사진 고르기</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="sr-only"
              required
            />
          </label>
          <p className="mt-2 text-sm text-amber-700">
            {file ? `선택된 파일: ${file.name}` : "아직 선택한 사진이 없습니다."}
          </p>
        </div>

        <label className="mt-4 block text-base font-semibold text-amber-800">
          카테고리 (7대 안전)
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 w-full rounded-lg border border-amber-200 px-3 py-3 text-base focus:border-amber-500 focus:outline-none"
        >
          <option value="">선택</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label className="mt-4 block text-base font-semibold text-amber-800">
          활동 설명
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="어떤 안전 활동을 했는지 적어주세요."
          className="mt-1 w-full rounded-lg border border-amber-200 px-3 py-3 text-base focus:border-amber-500 focus:outline-none"
          rows={4}
        />

        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-amber-500 py-3 text-lg font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
        >
          {loading ? "업로드 중…" : "업로드"}
        </button>
      </form>
      <p className="text-center text-sm text-amber-700/80">
        업로드 후 선생님 확인이 있으면 피드백과 포인트를 받을 수 있어요.
      </p>
    </div>
  );
}
