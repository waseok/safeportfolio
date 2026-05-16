import { createServiceClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { ShopGrid } from "./shop-grid";

/** 노란 상점 헤더·버튼용 진한 남색 */
const SHOP_NAVY = "#152a4a";

export default async function ShopPage() {
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
      <div
        className="rounded-3xl p-6 text-center shadow-xl"
        style={{
          background: "linear-gradient(135deg, #FFD700 0%, #FFC107 50%, #FFB300 100%)",
        }}
      >
        <div className="text-6xl mb-3">🏪</div>
        <h1 className="text-3xl font-black" style={{ color: SHOP_NAVY }}>
          안전 상점
        </h1>
        <p
          className="text-base font-bold mt-2 leading-relaxed px-2"
          style={{ color: SHOP_NAVY }}
        >
          포인트로 뱃지·꾸미기 등 아이템을 구매하세요!
        </p>
        <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-white/75 px-6 py-2.5 shadow-md">
          <span className="text-2xl">⭐</span>
          <span className="font-black text-xl md:text-2xl" style={{ color: SHOP_NAVY }}>
            {user.current_points} 포인트
          </span>
          <span className="font-bold text-base opacity-90" style={{ color: SHOP_NAVY }}>
            보유 중
          </span>
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
