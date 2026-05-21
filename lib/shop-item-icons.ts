/** 상점 아이템 이름 → 아이콘 경로 (DB image_url 없을 때 폴백) */
export const SHOP_ITEM_ICON_BY_NAME: Record<string, string> = {
  "급식 우선권": "/images/shop/meal-priority.png",
  사탕: "/images/shop/candy.png",
  연필: "/images/shop/pencil.png",
  "안전 뱃지": "/images/shop/safety-badge.png",
  "안전 스티커": "/images/shop/sticker.png",
  "안전 문해력 미니 노트": "/images/shop/mini-note.png",
  "캐릭터 손 소독제": "/images/shop/hand-sanitizer.png",
  에코백: "/images/shop/eco-bag.png",
  "급식 1등권": "/images/shop/meal-first.png",
};

export function resolveShopItemImageUrl(
  name: string,
  imageUrl: string | null | undefined,
): string | null {
  if (imageUrl?.trim()) return imageUrl.trim();
  return SHOP_ITEM_ICON_BY_NAME[name] ?? null;
}
