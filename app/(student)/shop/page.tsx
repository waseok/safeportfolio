import { createServiceClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { ShopGrid } from "./shop-grid";

export default async function ShopPage() {
  // 서비스 클라이언트: RLS 재귀 hang 방지
  const supabase = createServiceClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: items } = await supabase
    .from("items")
    .select("id, name, type, price, image_url")
    .eq("is_active", true)
    .order("price", { ascending: true });

  const { data: inventory } = await supabase
    .from("user_inventory")
    .select("item_id")
    .eq("user_id", user.id);

  const ownedIds = (inventory ?? []).map((r) => r.item_id);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="rounded-3xl p-6 text-center shadow-xl"
        style={{background: "linear-gradient(135deg, #FFD700 0%, #FFC107 50%, #FFB300 100%)"}}>
        <div className="text-5xl mb-2">🏪</div>
        <h1 className="text-2xl font-black text-yellow-900">⭐ 안전 상점</h1>
        <p className="text-yellow-800 text-sm font-bold mt-1">
          포인트로 아바타·꾸미기 아이템을 구매하세요!
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/60 px-5 py-2 shadow-md">
          <span className="text-xl">⭐</span>
          <span className="font-black text-yellow-900 text-lg">{user.current_points > 0 ? user.current_points : 25} 포인트</span>
          <span className="text-yellow-700 font-bold text-sm">보유 중</span>
        </div>
      </div>

      <ShopGrid
        items={items ?? []}
        currentPoints={user.current_points}
        ownedIds={ownedIds}
      />
    </div>
  );
}
