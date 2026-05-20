-- 안전 과제 테이블 (교사 수정·학생 조회 연동)
-- Supabase SQL Editor에서 실행하세요.
-- 7대 안전: 생활안전, 교통안전, 폭력예방, 중독예방, 재난안전, 직업안전, 응급처치

create table if not exists public.safety_assignments (
  id text primary key,
  title text not null,
  description text not null,
  category text not null,
  emoji text not null default '📝',
  due_date date not null,
  points int not null default 10 check (points >= 0),
  status text not null default 'active' check (status in ('active', 'closed')),
  sort_order int not null default 0,
  created_at timestamptz default timezone('utc'::text, now()),
  updated_at timestamptz default timezone('utc'::text, now())
);

alter table public.safety_assignments enable row level security;

drop policy if exists "safety_assignments_select_auth" on public.safety_assignments;
create policy "safety_assignments_select_auth"
  on public.safety_assignments for select
  to authenticated
  using (true);

drop policy if exists "teachers_manage_safety_assignments" on public.safety_assignments;
create policy "teachers_manage_safety_assignments"
  on public.safety_assignments for all
  to authenticated
  using (public.get_my_role() = 'teacher')
  with check (public.get_my_role() = 'teacher');

insert into public.safety_assignments (id, title, description, category, emoji, due_date, points, status, sort_order)
values
  ('assign-3', '생활 안전 수칙 포스터 만들기', '우리 가족·학급에서 꼭 지키면 좋은 생활 안전 수칙 3가지를 정해 손글씨 포스터로 만들어 보세요. 완성된 포스터를 인증샷으로 올려주세요.', '생활안전', '✏️', '2026-06-08', 15, 'active', 1),
  ('assign-1', '등하교 교통안전 실천 인증', '등·하교 길 횡단보도 신호 지키기, 인도 걷기, 자전거 헬멧 착용 등 교통안전 규칙을 하나 이상 실천하고 인증샷을 올려주세요. 설명란에 지킨 규칙을 적어주세요.', '교통안전', '🚦', '2026-06-10', 10, 'active', 2),
  ('assign-7', '학교 폭력 예방 동료 돌봄 실천', '친구를 존중하는 말 한마디, 왕따 방지 캠페인 포스터 만들기 등 폭력 예방 활동을 실천하고 사진으로 남겨 주세요.', '폭력예방', '🤝', '2026-06-12', 16, 'active', 3),
  ('assign-5', '중독·사이버 예방 서약 실천', '게임·SNS 과다 사용 줄이기, 개인정보 보호, 약물·사이버 중독 예방 다짐을 손글씨로 쓰거나 그림으로 표현해 인증샷을 올려주세요.', '중독예방', '💻', '2026-06-15', 12, 'active', 4),
  ('assign-6', '지진·태풍 대비 가방 점검', '비상용 손전등, 물, 간단한 약 등 우리 집·교실 비상 물품을 점검하는 모습을 인증해 주세요. 부족한 것이 있다면 메모해 두면 좋아요.', '재난안전', '🌧️', '2026-06-18', 14, 'active', 5),
  ('assign-2', '직업·실습 안전 수칙 인증', '미술·실과·과학 실습 등 학교 활동에서 도구·기구를 안전하게 사용하는 모습, 또는 직업 안전 수칙 포스터를 만들어 인증샷을 올려주세요.', '직업안전', '⚙️', '2026-06-22', 12, 'active', 6),
  ('assign-4', '응급 상황 대처 역할극·인증', '심폐소생술 순서를 말로 설명하거나 인형·쿠션으로 가슴 압박 연습하는 모습을 인증해 주세요. 보건·안전 영상을 참고해도 좋아요.', '응급처치', '🏥', '2026-06-30', 18, 'active', 7)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  emoji = excluded.emoji,
  due_date = excluded.due_date,
  points = excluded.points,
  status = excluded.status,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc'::text, now());

-- 기존 DB에 잘못된 카테고리(화재안전·사이버예방)가 남아 있을 때 보정
update public.gallery_posts set category = '직업안전' where category = '화재안전';
update public.gallery_posts set category = '중독예방' where category in ('사이버예방', '약물·사이버중독예방', '약물·사이버중독 예방');
