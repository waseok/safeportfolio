-- 상점 아이템 갱신 (기존 항목 비활성화 후 새 목록 + 아이콘 경로)
-- Supabase SQL Editor에서 실행하세요.

update public.items set is_active = false where true;

insert into public.items (name, type, price, image_url, is_active)
values
  ('급식 우선권', 'etc', 12, '/images/shop/sticker.png', true),
  ('사탕', 'etc', 3, '/images/shop/candy.png', true),
  ('연필', 'etc', 3, '/images/shop/pencil.png', true),
  ('안전 뱃지', 'badge', 10, '/images/shop/safety-badge.png', true),
  ('안전 스티커', 'etc', 5, '/images/shop/sticker.png', true),
  ('안전 문해력 미니 노트', 'etc', 6, '/images/shop/mini-note.png', true),
  ('캐릭터 손 소독제', 'etc', 8, '/images/shop/hand-sanitizer.png', true),
  ('에코백', 'etc', 15, '/images/shop/eco-bag.png', true),
  ('급식 1등권', 'etc', 20, '/images/shop/shield.png', true);
