-- SAFE 웹앱: Supabase DB 스키마
-- Supabase Dashboard > SQL Editor에서 순서대로 실행하세요.

-- UUID 확장 (없으면)
create extension if not exists "uuid-ossp";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text default 'student' check (role in ('student', 'teacher')),
  grade int,
  class_number int,
  student_number int,
  name text not null,
  current_points int default 0,
  total_points int default 0,
  equipped_avatar_id uuid,
  created_at timestamptz default timezone('utc'::text, now())
);

-- 1-1. 학급 테이블 (교사별 학급 & 학급코드)
create table if not exists public.classes (
  id uuid primary key default uuid_generate_v4(),
  teacher_id uuid references public.users(id) on delete cascade,
  grade int,
  class_number int,
  code text not null unique, -- 4자리 숫자 코드 (문자열로 저장)
  name text,
  created_at timestamptz default timezone('utc'::text, now())
);

-- users에 학급 연결 컬럼 추가 (있으면 건너뜀)
alter table public.users
  add column if not exists class_id uuid;

-- 2. 활동 인증 게시글 (갤러리)
create table if not exists public.gallery_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  image_url text not null,
  category text,
  description text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  teacher_feedback text,
  awarded_points int default 0,
  read_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now())
);

-- 3. 아이템 상점
create table if not exists public.items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null,
  price int not null,
  image_url text,
  is_active boolean default true
);

-- 4. 사용자 보유 아이템
create table if not exists public.user_inventory (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  item_id uuid references public.items(id) on delete cascade,
  purchased_at timestamptz default timezone('utc'::text, now()),
  unique(user_id, item_id)
);

-- user_inventory 참조용 (equipped_avatar_id는 items.id 참조 유지)
alter table public.users
  add constraint fk_equipped_avatar
  foreign key (equipped_avatar_id) references public.items(id) on delete set null;

-- RLS 활성화
alter table public.users enable row level security;
alter table public.classes enable row level security;
alter table public.gallery_posts enable row level security;
alter table public.items enable row level security;
alter table public.user_inventory enable row level security;

-- users: 본인만 읽기/수정, 교사는 모든 사용자 읽기
create policy "users_select_own" on public.users for select using (auth.uid() = id);
create policy "users_update_own" on public.users for update using (auth.uid() = id);
create policy "users_insert_own" on public.users for insert with check (auth.uid() = id);
create policy "teachers_select_all_users" on public.users for select using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'teacher')
);

-- gallery_posts: 학생은 본인 글만, 교사는 전체
create policy "gallery_select_own" on public.gallery_posts for select using (user_id = auth.uid());
create policy "gallery_insert_own" on public.gallery_posts for insert with check (user_id = auth.uid());
create policy "gallery_update_own" on public.gallery_posts for update using (user_id = auth.uid());
create policy "teachers_all_gallery" on public.gallery_posts for all using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'teacher')
);

-- items: 모두 읽기, 수정은 교사만 (관리용)
create policy "items_select_all" on public.items for select using (true);
create policy "items_manage_teacher" on public.items for all using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'teacher')
);

-- user_inventory: 본인만
create policy "inventory_select_own" on public.user_inventory for select using (user_id = auth.uid());
create policy "inventory_insert_own" on public.user_inventory for insert with check (user_id = auth.uid());

-- classes: 학급 조회는 모두 허용(코드로 검색), 생성/수정은 교사만
create policy "classes_select_all" on public.classes for select using (true);
create policy "classes_insert_teacher" on public.classes for insert with check (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'teacher')
);
create policy "classes_update_teacher" on public.classes for update using (teacher_id = auth.uid());
