import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LevelGraph } from "@/components/points/level-graph";
import { InventoryList } from "./inventory-list";

const POINTS_PER_LEVEL = 10;
const LEVEL_TITLES = [
  "안전 새싹 🌱", "안전 씨앗 🌿", "안전 꽃봉오리 🌸", "안전 꽃 🌻", "안전 나무 🌳",
  "안전 숲 🌲", "안전 수호자 🛡️", "안전 영웅 🦸", "안전 챔피언 🏆", "안전 레전드 ⭐"
];

export default async function MypagePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: inventory } = await supabase
    .from("user_inventory")
    .select("item_id")
    .eq("user_id", user.id);

  const itemIds = (inventory ?? []).map((r) => r.item_id).filter(Boolean);
  const { data: itemRows } = itemIds.length > 0
    ? await supabase.from("items").select("id, name, type, image_url").in("id", itemIds)
    : { data: [] };

  const itemMap = new Map((itemRows ?? []).map((i) => [i.id, { id: i.id, name: i.name, type: i.type, image_url: i.image_url }]));
  const items = itemIds.map((id) => itemMap.get(id) ?? { id, name: "-", type: "-", image_url: null as string | null });

  const level = Math.floor(user.total_points / POINTS_PER_LEVEL) + 1;
  const currentLevelPoints = user.total_points % POINTS_PER_LEVEL;
  const nextLevelAt = level * POINTS_PER_LEVEL;
  const levelTitle = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];

  return (
    <div className="space-y-6">
      {/* 프로필 헤더 */}
      <div className="rounded-3xl p-6 text-white shadow-xl"
        style={{background: "linear-gradient(135deg, #ff6b2b 0%, #ff8c42 50%, #ffd700 100%)"}}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center text-3xl border-2 border-white/50">
            🧑‍🚒
          </div>
          <div>
            <p className="text-orange-100 text-sm font-semibold">내 안전 프로필</p>
            <h1 className="text-2xl font-black">{user.name}</h1>
            <p className="text-orange-100 text-sm">{levelTitle}</p>
          </div>
        </div>
      </div>

      {/* 포인트 & 레벨 */}
      <section className="rounded-2xl border-2 border-orange-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-black text-gray-900">⭐ 포인트 & 레벨</h2>
        <LevelGraph
          totalPoints={user.total_points}
          currentPoints={user.current_points}
          level={level}
          currentLevelPoints={currentLevelPoints}
          nextLevelAt={nextLevelAt}
          pointsPerLevel={POINTS_PER_LEVEL}
        />
      </section>

      {/* 아이템 */}
      <section>
        <h2 className="mb-4 text-lg font-black text-gray-900">🎒 보유 아이템 · 장착</h2>
        <InventoryList items={items} equippedId={user.equipped_avatar_id} />
      </section>
    </div>
  );
}
