import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LevelGraph } from "@/components/points/level-graph";
import { InventoryList } from "./inventory-list";

const POINTS_PER_LEVEL = 10;

export default async function MypagePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: inventory } = await supabase
    .from("user_inventory")
    .select("item_id")
    .eq("user_id", user.id);

  const itemIds = (inventory ?? []).map((r) => r.item_id).filter(Boolean);
  const { data: itemRows } =
    itemIds.length > 0
      ? await supabase
          .from("items")
          .select("id, name, type, image_url")
          .in("id", itemIds)
      : { data: [] };

  const itemMap = new Map(
    (itemRows ?? []).map((i) => [i.id, { id: i.id, name: i.name, type: i.type, image_url: i.image_url }])
  );
  const items = itemIds.map((id) => itemMap.get(id) ?? { id, name: "-", type: "-", image_url: null as string | null });

  const level = Math.floor(user.total_points / POINTS_PER_LEVEL) + 1;
  const currentLevelPoints = user.total_points % POINTS_PER_LEVEL;
  const nextLevelAt = level * POINTS_PER_LEVEL;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-amber-900">마이페이지</h1>

      <section className="rounded-2xl border border-amber-200 bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-amber-900">
          누적 포인트 & 레벨
        </h2>
        <LevelGraph
          totalPoints={user.total_points}
          currentPoints={user.current_points}
          level={level}
          currentLevelPoints={currentLevelPoints}
          nextLevelAt={nextLevelAt}
          pointsPerLevel={POINTS_PER_LEVEL}
        />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-amber-900">
          보유 아이템 · 장착
        </h2>
        <InventoryList
          items={items}
          equippedId={user.equipped_avatar_id}
        />
      </section>
    </div>
  );
}
