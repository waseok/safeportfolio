-- 기본 상점 아이템 (중복 방지)
insert into public.items (name, type, price, image_url, is_active)
select v.name, v.type, v.price, v.image_url, true
from (
  values
    ('🍬 사탕', 'etc', 2, null),
    ('✏️ 연필', 'etc', 3, null),
    ('📒 안전노트', 'etc', 4, null),
    ('🪖 안전모', 'avatar', 8, null),
    ('🦺 안전조끼', 'avatar', 10, null),
    ('🏅 안전 배지', 'badge', 6, null),
    ('🧤 보호장갑', 'avatar', 7, null),
    ('🚨 비상벨 스티커', 'badge', 5, null)
) as v(name, type, price, image_url)
where not exists (
  select 1 from public.items i where i.name = v.name
);
