import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { ShopGrid } from "./shop-grid";

export default async function ShopPage() {
  const supabase = await createClient();
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
      <h1 className="text-2xl font-bold text-amber-900">아이템 상점</h1>
      <p className="text-amber-800/80">
        포인트로 아바타·꾸미기 아이템을 구매하세요.
      </p>
      <ShopGrid
        items={items ?? []}
        currentPoints={user.current_points}
        ownedIds={ownedIds}
      />
    </div>
  );
}
