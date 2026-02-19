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
      className="relative overflow-hidden rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100/80 shadow-lg transition hover:scale-[1.02] hover:shadow-xl"
      style={{
        boxShadow:
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1), inset 0 0 0 1px rgba(251 191 36 / 0.3)",
      }}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-xl bg-amber-200/50">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-amber-600">
            🎁
          </div>
        )}
        {owned && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-amber-500 px-3 py-1 text-sm font-medium text-white">
              보유 중
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-amber-900">{item.name}</h3>
        <p className="text-xs text-amber-700/80">{item.type}</p>
        <p className="mt-2 text-lg font-bold text-amber-600">{item.price} P</p>
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
            className="mt-3 w-full rounded-xl bg-amber-500 py-2 font-medium text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "처리 중…" : canBuy ? "구매" : "포인트 부족"}
          </button>
        )}
      </div>
    </article>
  );
}
