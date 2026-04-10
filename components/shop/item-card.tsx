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
      style={{borderColor: owned ? "#6EE7B7" : "#FCD34D"}}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-yellow-50">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl">
            🎁
          </div>
        )}
        {owned && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-900/40">
            <span className="rounded-full bg-green-400 px-3 py-1 text-xs font-bold text-green-900 shadow-sm">
              ✓ 보유
            </span>
          </div>
        )}
        <div className="absolute top-1.5 right-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold shadow-sm"
          style={{background: "linear-gradient(135deg, #FFD700, #FFC107)", color: "#78350f"}}>
          ⭐ {item.price}P
        </div>
      </div>
      <div className="p-2.5">
        <h3 className="font-bold text-gray-900 text-sm truncate">{item.name}</h3>
        <p className="text-[11px] text-gray-500 mt-0.5">{item.type}</p>
        {error && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
        {!owned && (
          <button
            type="button"
            onClick={handlePurchase}
            disabled={!canBuy || loading}
            className="mt-2 w-full rounded-lg py-1.5 text-sm font-bold shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 transition"
            style={{background: canBuy ? "linear-gradient(135deg, #FFD700, #FFC107)" : "#E5E7EB", color: canBuy ? "#78350f" : "#9CA3AF"}}
          >
            {loading ? "처리 중…" : canBuy ? "🛒 구매" : "포인트 부족"}
          </button>
        )}
      </div>
    </article>
  );
}
