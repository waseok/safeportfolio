"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ItemCard } from "@/components/shop/item-card";

type Item = {
  id: string;
  name: string;
  type: string;
  price: number;
  image_url: string | null;
};

export function ShopGrid({
  items,
  currentPoints: initialPoints,
  ownedIds,
}: {
  items: Item[];
  currentPoints: number;
  ownedIds: string[];
}) {
  const router = useRouter();
  const [points, setPoints] = useState(initialPoints);
  const ownedSet = new Set(ownedIds);

  function handlePurchased(newPoints: number) {
    setPoints(newPoints);
    router.refresh();
  }

  if (!items.length) {
    return (
      <p className="text-amber-800/80">현재 판매 중인 아이템이 없습니다.</p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          currentPoints={points}
          owned={ownedSet.has(item.id)}
          onPurchased={handlePurchased}
        />
      ))}
    </div>
  );
}
