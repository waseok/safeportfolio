"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  name: string;
  type: string;
  image_url: string | null;
};

export function InventoryList({
  items,
  equippedId,
}: {
  items: Item[];
  equippedId: string | null;
}) {
  const router = useRouter();
  const [equipped, setEquipped] = useState<string | null>(equippedId);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleEquip(itemId: string) {
    if (equipped === itemId) return;
    setLoading(itemId);
    const supabase = createClient();
    const { error } = await supabase
      .from("users")
      .update({ equipped_avatar_id: itemId })
      .eq("id", (await supabase.auth.getUser()).data.user?.id);
    if (!error) {
      setEquipped(itemId);
      router.refresh();
    }
    setLoading(null);
  }

  async function handleUnequip() {
    setLoading("_");
    const supabase = createClient();
    const { error } = await supabase
      .from("users")
      .update({ equipped_avatar_id: null })
      .eq("id", (await supabase.auth.getUser()).data.user?.id);
    if (!error) {
      setEquipped(null);
      router.refresh();
    }
    setLoading(null);
  }

  if (!items.length) {
    return (
      <p className="text-amber-800/80">
        보유한 아이템이 없어요. 상점에서 구매해보세요.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li
          key={item.id}
          className={`rounded-xl border-2 bg-white p-4 shadow ${
            equipped === item.id
              ? "border-amber-500 ring-2 ring-amber-200"
              : "border-amber-200"
          }`}
        >
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-amber-100">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-4xl">
                🎁
              </div>
            )}
          </div>
          <p className="mt-2 font-medium text-amber-900">{item.name}</p>
          <p className="text-xs text-amber-700/80">{item.type}</p>
          {equipped === item.id ? (
            <button
              type="button"
              onClick={handleUnequip}
              disabled={loading !== null}
              className="mt-2 w-full rounded-lg border border-amber-300 py-1.5 text-sm text-amber-800 hover:bg-amber-50 disabled:opacity-50"
            >
              장착 해제
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleEquip(item.id)}
              disabled={loading !== null}
              className="mt-2 w-full rounded-lg bg-amber-500 py-1.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
            >
              {loading === item.id ? "처리 중…" : "장착"}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
