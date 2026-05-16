"use client";

import Image from "next/image";
import { useState } from "react";

type Item = {
  id: string;
  name: string;
  type: string;
  price: number;
  image_url: string | null;
};

type Props = {
  item: Item;
  currentPoints: number;
  owned: boolean;
  onPurchased: (newPoints: number) => void;
};

export function ItemCard({ item, currentPoints, owned, onPurchased }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canBuy = !owned && currentPoints >= item.price;

  async function handlePurchase() {
    if (!canBuy || loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/shop/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "구매 실패");
      onPurchased(data.newPoints);
    } catch (e) {
      setError(e instanceof Error ? e.message : "구매 중 오류");
    } finally {
      setLoading(false);
    }
  }

  return (
    <article
      className="relative overflow-hidden rounded-2xl border bg-white shadow-sm transition card-hover"
      style={{ borderColor: owned ? "#34d399" : "#fde68a" }}
    >
      {/* 상단: 아이템 아이콘·이미지 크게, 선물 박스 느낌 축소(비율 낮춤) */}
      <div className="relative aspect-[5/3] w-full overflow-hidden bg-gradient-to-b from-amber-50 to-amber-100/40">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-contain p-3"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-7xl" aria-hidden>
            🏷️
          </div>
        )}
        {owned && (
          <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/35">
            <span className="rounded-full bg-emerald-300 px-3 py-1 text-sm font-extrabold text-emerald-950 shadow-sm">
              ✓ 보유
            </span>
          </div>
        )}
        <div
          className="absolute top-2 right-2 rounded-full px-3 py-2 text-[15px] font-extrabold shadow-sm md:text-lg"
          style={{
            background: "linear-gradient(135deg, #FFD700, #FFC107)",
            color: "#78350f",
          }}
        >
          ⭐ {item.price}P
        </div>
      </div>
      <div className="p-3.5">
        <h3 className="font-extrabold text-gray-900 text-lg leading-snug line-clamp-2">{item.name}</h3>
        {/* DB의 type 영어 노출 안 함 */}
        {error && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {!owned && (
          <button
            type="button"
            onClick={handlePurchase}
            disabled={!canBuy || loading}
            className="mt-3 w-full rounded-xl py-3 text-[17px] font-extrabold shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 transition"
            style={{
              background: canBuy ? "linear-gradient(135deg, #FFD700, #FFC107)" : "#E5E7EB",
              color: canBuy ? "#78350f" : "#9CA3AF",
            }}
          >
            {loading ? "처리 중…" : canBuy ? "🛒 구매" : "포인트 부족"}
          </button>
        )}
      </div>
    </article>
  );
}
