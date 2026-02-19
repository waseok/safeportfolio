# Supabase 셋업 가이드

## 1. 프로젝트 생성
- [Supabase](https://supabase.com) 로그인 후 New Project 생성.
- Region 선택 후 DB 비밀번호 저장.

## 2. 테이블 생성 / 업데이트
- Dashboard > **SQL Editor** 이동.
- 처음 한 번은 `schema.sql` 전체를 **Run** 해서 테이블과 RLS를 생성합니다.
- 이후 스키마가 변경되었을 때도 같은 파일을 다시 실행하면,
  `create table if not exists` / `add column if not exists` 덕분에 안전하게 보완 컬럼/테이블이 추가됩니다.

## 3. Storage 버킷
- **Storage** > **New bucket** > 이름: `cert-images`, Public: 필요 시 체크.
- **Policies**에서:
  - **Upload**: `authenticated` 사용자만 허용 (예: `bucket_id = 'cert-images' AND auth.role() = 'authenticated'`).
  - **Select**: 로그인 사용자 또는 공개 읽기 정책 추가.

## 4. 환경 변수
프로젝트 루트에 `.env.local` 생성:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

- URL/Anon key는 Supabase Dashboard > **Settings** > **API**에서 확인.
- 서버에서 관리자 작업(승인/포인트 지급 등)을 위해 **Service Role Key**가 필요하면 `SUPABASE_SERVICE_ROLE_KEY` 추가 (절대 클라이언트에 노출 금지).
