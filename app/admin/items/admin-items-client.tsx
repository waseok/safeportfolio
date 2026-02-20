"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const ITEM_TYPES = [
  { value: "avatar", label: "아바타" },
  { value: "badge", label: "뱃지" },
  { value: "etc", label: "기타" },
];

const PRESET_ITEMS = [
  { name: "🍬 사탕", type: "etc", price: 2 },
  { name: "✏️ 연필", type: "etc", price: 3 },
  { name: "📒 안전노트", type: "etc", price: 4 },
  { name: "🪖 안전모", type: "avatar", price: 8 },
  { name: "🦺 안전조끼", type: "avatar", price: 10 },
  { name: "🏅 안전 배지", type: "badge", price: 6 },
];

type ItemRow = {
  id: string;
  name: string;
  type: string;
  price: number;
  image_url: string | null;
  is_active: boolean;
};

export function AdminItemsClient({
  initialItems,
}: {
  initialItems: ItemRow[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<ItemRow[]>(initialItems);
  const [name, setName] = useState("");
  const [type, setType] = useState("avatar");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [presetLoading, setPresetLoading] = useState(false);

  const [editing, setEditing] = useState<ItemRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("avatar");
  const [editPrice, setEditPrice] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);
    const priceNum = parseInt(price, 10);
    if (!name.trim()) {
      setAddError("이름을 입력해주세요.");
      return;
    }
    if (!Number.isInteger(priceNum) || priceNum < 0) {
      setAddError("가격을 0 이상의 숫자로 입력해주세요.");
      return;
    }
    setAddLoading(true);
    try {
      const res = await fetch("/api/admin/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
          price: priceNum,
          image_url: imageUrl.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "등록 실패");
      setItems((prev) => [...prev, data.item]);
      setName("");
      setPrice("");
      setImageUrl("");
      router.refresh();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "등록 중 오류");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleAddPresetItems() {
    setAddError(null);
    setPresetLoading(true);
    try {
      const existingNames = new Set(items.map((i) => i.name));
      const targets = PRESET_ITEMS.filter((i) => !existingNames.has(i.name));
      for (const item of targets) {
        const res = await fetch("/api/admin/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: item.name,
            type: item.type,
            price: item.price,
            image_url: null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "기본 상품 추가 실패");
        setItems((prev) => [...prev, data.item]);
      }
      router.refresh();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "기본 상품 추가 중 오류");
    } finally {
      setPresetLoading(false);
    }
  }

  function openEdit(item: ItemRow) {
    setEditing(item);
    setEditName(item.name);
    setEditType(item.type);
    setEditPrice(String(item.price));
    setEditImageUrl(item.image_url ?? "");
    setEditActive(item.is_active);
    setEditError(null);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setEditError(null);
    const priceNum = parseInt(editPrice, 10);
    if (!Number.isInteger(priceNum) || priceNum < 0) {
      setEditError("가격을 0 이상의 숫자로 입력해주세요.");
      return;
    }
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/items/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          type: editType,
          price: priceNum,
          image_url: editImageUrl.trim() || null,
          is_active: editActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "수정 실패");
      setItems((prev) =>
        prev.map((i) => (i.id === editing.id ? data.item : i))
      );
      setEditing(null);
      router.refresh();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "수정 중 오류");
    } finally {
      setEditLoading(false);
    }
  }

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">새 아이템 등록</h2>
        <div className="mb-3">
          <button
            type="button"
            onClick={handleAddPresetItems}
            disabled={presetLoading}
            className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-50"
          >
            {presetLoading ? "기본 상품 추가 중…" : "기본 상품 자동 추가 (사탕·연필 등)"}
          </button>
        </div>
        <form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          >
            {ITEM_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            placeholder="가격 (P)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          />
          <input
            type="url"
            placeholder="이미지 URL (선택)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={addLoading}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-50"
          >
            {addLoading ? "등록 중…" : "등록"}
          </button>
        </form>
        {addError && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {addError}
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">등록된 아이템</h2>
        {items.length === 0 ? (
          <p className="text-slate-600">등록된 아이템이 없습니다. 위 폼에서 추가해보세요.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-3 font-medium text-slate-700">미리보기</th>
                  <th className="p-3 font-medium text-slate-700">이름</th>
                  <th className="p-3 font-medium text-slate-700">유형</th>
                  <th className="p-3 font-medium text-slate-700">가격</th>
                  <th className="p-3 font-medium text-slate-700">노출</th>
                  <th className="p-3 font-medium text-slate-700">관리</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="p-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-slate-100">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center text-xl">
                            🎁
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-medium text-slate-900">{item.name}</td>
                    <td className="p-3 text-slate-600">
                      {ITEM_TYPES.find((t) => t.value === item.type)?.label ?? item.type}
                    </td>
                    <td className="p-3 text-slate-700">{item.price} P</td>
                    <td className="p-3">
                      <span
                        className={
                          item.is_active
                            ? "text-green-600 font-medium"
                            : "text-slate-400"
                        }
                      >
                        {item.is_active ? "노출" : "숨김"}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
                      >
                        수정
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-modal-title"
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="edit-modal-title" className="text-lg font-bold text-slate-800">
              아이템 수정
            </h2>
            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3">
              <label className="block text-sm font-medium text-slate-700">이름</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                required
              />
              <label className="block text-sm font-medium text-slate-700">유형</label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              >
                {ITEM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <label className="block text-sm font-medium text-slate-700">가격 (P)</label>
              <input
                type="number"
                min={0}
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                required
              />
              <label className="block text-sm font-medium text-slate-700">
                이미지 URL (선택)
              </label>
              <input
                type="url"
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                />
                <span className="text-sm font-medium text-slate-700">상점에 노출</span>
              </label>
              {editError && (
                <p className="text-sm text-red-600" role="alert">
                  {editError}
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 rounded-lg bg-amber-500 py-2 font-medium text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  {editLoading ? "저장 중…" : "저장"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
