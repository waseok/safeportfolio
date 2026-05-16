-- 상점 아이템 갱신 (기존 항목 비활성화 후 새 목록 삽입)
-- Supabase SQL Editor에서 실행하세요. (기존 user_inventory FK가 있으면 이름으로만 추가하는 방식을 쓰세요.)

update public.items set is_active = false where true;

insert into public.items (name, type, price, image_url, is_active)
values
  ('급식 우선권', 'etc', 12, null, true),
  ('사탕', 'etc', 3, null, true),
  ('연필', 'etc', 3, null, true),
  ('안전 뱃지', 'badge', 10, null, true),
  ('안전 스티커', 'etc', 5, null, true),
  ('안전 문해력 미니 노트', 'etc', 6, null, true),
  ('캐릭터 손 소독제', 'etc', 8, null, true),
  ('에코백', 'etc', 15, null, true),
  ('급식 1등권', 'etc', 20, null, true);
