# Supabase 설정 가이드

## 필수 환경변수 (Vercel 대시보드 또는 .env.local)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   ← 반드시 필요! 없으면 모든 DB 조회가 실패합니다
```

## DB 스키마 적용 (최초 설정 또는 오류 발생 시)

1. Supabase Dashboard → SQL Editor
2. `supabase/schema.sql` 전체 내용 복사 → 붙여넣기 → Run
3. 완료 후 `/api/debug` 에서 모든 항목이 OK인지 확인

## 주의: Email Confirmation 비활성화

Supabase Dashboard → Authentication → Providers → Email  
**"Confirm email" 옵션을 OFF**로 설정해야 테스트 로그인이 작동합니다.

## 스토리지 버킷 생성

Supabase Dashboard → Storage → New Bucket  
- Name: `cert-images`  
- Public: ✅ (체크)

## RLS 정책 핵심 원칙 (한글)

현재 스키마는 `SECURITY DEFINER` 함수로 RLS 재귀 hang을 방지합니다:

- `get_my_role()` — 현재 사용자 역할 반환 (RLS 없이 실행)
- `get_my_class_id()` — 현재 사용자 학급 ID 반환 (RLS 없이 실행)

이 함수들이 없으면 `teachers_all_gallery` 등의 정책이 무한 재귀를 일으켜 hang이 발생합니다.  
오류 시 schema.sql을 다시 실행하세요.

## 진단

앱 배포 후 브라우저에서 `/api/debug` 에 접속하면 환경변수와 DB 연결 상태를 확인할 수 있습니다.
