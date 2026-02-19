"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const CATEGORIES = ["교통", "생활", "재난", "기타"];

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
      <h1 className="text-2xl font-bold text-amber-900">인증샷 업로드</h1>
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-amber-200 bg-white p-6 shadow"
      >
        <label className="block text-sm font-medium text-amber-800">
          사진
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-1 block w-full text-sm text-amber-800"
          required
        />

        <label className="mt-4 block text-sm font-medium text-amber-800">
          카테고리
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 w-full rounded-lg border border-amber-200 px-3 py-2 focus:border-amber-500 focus:outline-none"
        >
          <option value="">선택</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label className="mt-4 block text-sm font-medium text-amber-800">
          활동 설명
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="어떤 안전 활동을 했는지 적어주세요."
          className="mt-1 w-full rounded-lg border border-amber-200 px-3 py-2 focus:border-amber-500 focus:outline-none"
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
          className="mt-6 w-full rounded-lg bg-amber-500 py-3 font-medium text-white hover:bg-amber-600 disabled:opacity-50"
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
