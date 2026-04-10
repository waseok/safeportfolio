-- SAFE 웹앱: Supabase DB 스키마
-- Supabase Dashboard > SQL Editor에서 전체 복사 후 실행하세요.

-- UUID 확장 (없으면)
create extension if not exists "uuid-ossp";

-- ===========================
-- 테이블 생성
-- ===========================

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

create table if not exists public.classes (
  id uuid primary key default uuid_generate_v4(),
  teacher_id uuid references public.users(id) on delete cascade,
  grade int,
  class_number int,
  code text not null unique,
  name text,
  created_at timestamptz default timezone('utc'::text, now())
);

alter table public.users
  add column if not exists class_id uuid references public.classes(id) on delete set null;

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

create table if not exists public.items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null,
  price int not null,
  image_url text,
  is_active boolean default true
);

create table if not exists public.user_inventory (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  item_id uuid references public.items(id) on delete cascade,
  purchased_at timestamptz default timezone('utc'::text, now()),
  unique(user_id, item_id)
);

alter table public.users
  drop constraint if exists fk_equipped_avatar;
alter table public.users
  add constraint fk_equipped_avatar
  foreign key (equipped_avatar_id) references public.items(id) on delete set null;

-- ===========================
-- RLS 재귀 방지용 헬퍼 함수
-- SECURITY DEFINER = RLS 없이 실행 → 재귀 hang 완전 차단
-- ===========================

-- 현재 로그인 사용자의 role 반환
create or replace function public.get_my_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

-- 현재 로그인 사용자의 class_id 반환
create or replace function public.get_my_class_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select class_id from public.users where id = auth.uid()
$$;

-- ===========================
-- RLS 활성화
-- ===========================
alter table public.users enable row level security;
alter table public.classes enable row level security;
alter table public.gallery_posts enable row level security;
alter table public.items enable row level security;
alter table public.user_inventory enable row level security;

-- ===========================
-- users 정책
-- 본인 레코드만 읽기/쓰기 허용
-- (users 정책 안에서 users를 다시 조회하지 않음 → 재귀 없음)
-- ===========================
drop policy if exists "users_select_own" on public.users;
drop policy if exists "users_update_own" on public.users;
drop policy if exists "users_insert_own" on public.users;
drop policy if exists "teachers_select_all_users" on public.users;

create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id);

create policy "users_insert_own"
  on public.users for insert
  with check (auth.uid() = id);

-- ===========================
-- gallery_posts 정책
-- FOR ALL 대신 개별 operation으로 분리 → 암묵적 WITH CHECK 문제 방지
-- get_my_role() / get_my_class_id() 사용 → users 재귀 조회 없음
-- ===========================
drop policy if exists "gallery_select_own" on public.gallery_posts;
drop policy if exists "gallery_select_class_approved" on public.gallery_posts;
drop policy if exists "gallery_insert_own" on public.gallery_posts;
drop policy if exists "gallery_update_own" on public.gallery_posts;
drop policy if exists "teachers_all_gallery" on public.gallery_posts;
drop policy if exists "teachers_select_gallery" on public.gallery_posts;
drop policy if exists "teachers_update_gallery" on public.gallery_posts;
drop policy if exists "teachers_delete_gallery" on public.gallery_posts;

-- 학생: 본인 글 조회
create policy "gallery_select_own"
  on public.gallery_posts for select
  using (user_id = auth.uid());

-- 학생: 같은 학급의 승인된 글 조회 (get_my_class_id() 사용 → 재귀 없음)
create policy "gallery_select_class_approved"
  on public.gallery_posts for select
  using (
    status = 'approved'
    and exists (
      select 1 from public.users u
      where u.id = user_id
        and u.class_id = public.get_my_class_id()
        and u.class_id is not null
    )
  );

-- 학생: 본인 글 업로드
create policy "gallery_insert_own"
  on public.gallery_posts for insert
  with check (user_id = auth.uid());

-- 학생: 본인 글 수정 (read_at 업데이트용)
create policy "gallery_update_own"
  on public.gallery_posts for update
  using (user_id = auth.uid());

-- 교사: 전체 조회 (get_my_role() 사용 → 재귀 없음)
create policy "teachers_select_gallery"
  on public.gallery_posts for select
  using (public.get_my_role() = 'teacher');

-- 교사: 전체 수정 (승인/반려/피드백)
create policy "teachers_update_gallery"
  on public.gallery_posts for update
  using (public.get_my_role() = 'teacher');

-- 교사: 삭제 가능
create policy "teachers_delete_gallery"
  on public.gallery_posts for delete
  using (public.get_my_role() = 'teacher');

-- ===========================
-- items 정책
-- ===========================
drop policy if exists "items_select_all" on public.items;
drop policy if exists "items_manage_teacher" on public.items;
drop policy if exists "items_insert_teacher" on public.items;
drop policy if exists "items_update_teacher" on public.items;
drop policy if exists "items_delete_teacher" on public.items;

-- 모든 사용자: 아이템 조회
create policy "items_select_all"
  on public.items for select
  using (true);

-- 교사: 아이템 추가/수정/삭제 (get_my_role() 사용)
create policy "items_insert_teacher"
  on public.items for insert
  with check (public.get_my_role() = 'teacher');

create policy "items_update_teacher"
  on public.items for update
  using (public.get_my_role() = 'teacher');

create policy "items_delete_teacher"
  on public.items for delete
  using (public.get_my_role() = 'teacher');

-- ===========================
-- user_inventory 정책
-- ===========================
drop policy if exists "inventory_select_own" on public.user_inventory;
drop policy if exists "inventory_insert_own" on public.user_inventory;

create policy "inventory_select_own"
  on public.user_inventory for select
  using (user_id = auth.uid());

create policy "inventory_insert_own"
  on public.user_inventory for insert
  with check (user_id = auth.uid());

-- ===========================
-- classes 정책
-- ===========================
drop policy if exists "classes_select_all" on public.classes;
drop policy if exists "classes_insert_teacher" on public.classes;
drop policy if exists "classes_update_teacher" on public.classes;

-- 모든 사용자: 학급 코드로 검색 가능
create policy "classes_select_all"
  on public.classes for select
  using (true);

-- 교사: 학급 생성 (get_my_role() 사용)
create policy "classes_insert_teacher"
  on public.classes for insert
  with check (public.get_my_role() = 'teacher');

-- 교사: 본인 학급만 수정
create policy "classes_update_teacher"
  on public.classes for update
  using (teacher_id = auth.uid());
