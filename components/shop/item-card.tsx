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
      className="relative overflow-hidden rounded-3xl border-2 bg-white shadow-md transition card-hover"
      style={{borderColor: owned ? "#6EE7B7" : "#FCD34D"}}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-2xl bg-yellow-50">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">
            🎁
          </div>
        )}
        {owned && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-900/40">
            <span className="rounded-full bg-green-400 px-4 py-1.5 text-sm font-black text-green-900 shadow-md">
              ✓ 보유 중
            </span>
          </div>
        )}
        <div className="absolute top-2 right-2 rounded-full px-2.5 py-1 text-xs font-black shadow-md"
          style={{background: "linear-gradient(135deg, #FFD700, #FFC107)", color: "#78350f"}}>
          ⭐ {item.price}P
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-black text-gray-900 text-base">{item.name}</h3>
        <p className="text-xs text-gray-500 rounded-full bg-gray-100 inline-block px-2 py-0.5 mt-1">{item.type}</p>
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
            className="mt-3 w-full rounded-full py-2.5 font-black text-gray-900 shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 transition"
            style={{background: canBuy ? "linear-gradient(135deg, #FFD700, #FFC107)" : "#E5E7EB", color: canBuy ? "#78350f" : "#9CA3AF"}}
          >
            {loading ? "처리 중…" : canBuy ? "🛒 구매하기" : "⭐ 포인트 부족"}
          </button>
        )}
      </div>
    </article>
  );
}
