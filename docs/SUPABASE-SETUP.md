# Supabase 설정 가이드 (SAFE 프로젝트)

## 1. 환경 변수 매핑

Supabase 대시보드 **Settings → API**에서 보이는 값과 앱에서 쓰는 환경 변수는 아래처럼 맞춥니다.

| Supabase 대시보드 표기 | 앱 환경 변수 이름 | 설명 |
|------------------------|-------------------|------|
| **Project URL** (API URL) | `NEXT_PUBLIC_SUPABASE_URL` | 예: `https://xxxxx.supabase.co` |
| **anon / public (퍼블리서블 키)** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 브라우저에 노출돼도 되는 공개 키 |
| **service_role (시크릿 키)** | `SUPABASE_SERVICE_ROLE_KEY` | **서버 전용**. 절대 브라우저/클라이언트에 노출하면 안 됨 |

- 로컬: 프로젝트 루트의 `.env.local`에 위 변수들을 넣습니다.
- 배포(Vercel 등): 호스팅 서비스의 **Environment Variables**에 같은 이름으로 넣습니다.

`.env.local` 예시 (실제 키는 본인 Supabase에서 복사):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_anon_퍼블리서블_키
SUPABASE_SERVICE_ROLE_KEY=여기에_service_role_시크릿_키
```

---

## 2. 테스트 계정이란? (선택 사항)

로그인 페이지 하단에 **「교사 테스트 입장」「학생 테스트 입장」** 버튼이 있습니다.

- **역할**: 개발·데모할 때 **이메일/비밀번호 입력 없이** 한 번에 교사 또는 학생으로 로그인하기 위한 용도입니다.
- **동작**:  
  - 환경 변수에 지정한 이메일/비밀번호로 Supabase 로그인 시도  
  - 계정이 없으면 자동으로 회원가입 후, `users` 테이블에 교사/학생 프로필을 넣고 해당 역할로 이동
- **필수 아님**:  
  - 이 환경 변수를 **비워두면** 해당 버튼은 나타나지 않고, "테스트 계정 환경변수가 설정되어 있지 않습니다"처럼 동작할 수 있습니다.  
  - 그냥 **교사 회원가입** / **학생 입장(학급코드)** 로만 사용해도 됩니다.

설정할 때만 아래 4개를 `.env.local`(또는 배포 환경 변수)에 넣으면 됩니다.

| 환경 변수 | 설명 |
|-----------|------|
| `NEXT_PUBLIC_TEST_TEACHER_EMAIL` | 테스트 교사 로그인 이메일 |
| `NEXT_PUBLIC_TEST_TEACHER_PASSWORD` | 테스트 교사 비밀번호 |
| `NEXT_PUBLIC_TEST_STUDENT_EMAIL` | 테스트 학생 로그인 이메일 |
| `NEXT_PUBLIC_TEST_STUDENT_PASSWORD` | 테스트 학생 비밀번호 |

- 교사/학생 각각 **Supabase Auth에 등록될 계정**이므로, 원하면 **임의의 이메일·비밀번호 한 세트**를 정해서 위처럼 넣으면 됩니다.  
- 테스트 계정을 **쓰지 않을 거면** 이 네 개는 비워두거나 아예 넣지 않아도 됩니다.

---

## 3. 배포 후 Supabase에서 꼭 할 설정

앱을 Vercel 등에 배포한 **배포 URL**이 생기면, Supabase에서 아래를 설정해야 로그인·회원가입·리다이렉트가 정상 동작합니다.

### 3-1. Redirect URL 등록 (Authentication)

1. Supabase 대시보드 → **Authentication** → **URL Configuration**
2. **Redirect URLs**에 다음을 추가:
   - `https://당신배포도메인.vercel.app/**`
   - (커스텀 도메인 쓰면) `https://당신도메인.com/**`
3. **Site URL**은 실제 서비스 주소로 두는 것을 권장 (예: `https://당신배포도메인.vercel.app`)

이렇게 해야 로그인/회원가입 후 다시 앱으로 돌아올 수 있습니다.

### 3-2. 이메일 인증 끄기 (쉽게 가입하려면 필수)

SAFE는 **이메일 인증 없이** 바로 가입·로그인되도록 사용하는 것을 권장합니다.

1. Supabase 대시보드 → **Authentication** → **Providers**
2. **Email** 클릭
3. **Confirm email** 옵션을 **끄기(OFF)** 로 설정 후 저장

이렇게 하면 회원가입 시 메일 인증 링크 없이 바로 계정이 활성화되고, 가입 직후 관리자 페이지로 이동합니다.

### 3-3. DB·Storage는 로컬과 동일

- **테이블·RLS**: 로컬에서 쓰는 것과 같은 Supabase 프로젝트를 쓰면, `schema.sql`로 만든 테이블·RLS가 그대로 적용됩니다.
- **Storage**: 인증샷 업로드용 버킷 `cert-images`가 있다면, 배포 환경에서도 같은 버킷을 쓰므로 별도 설정은 없어도 됩니다. (버킷이 없으면 `supabase/README.md` 등에 있는 Storage 생성·정책 설정을 한 번 적용하면 됩니다.)

### 3-4. 로그인이 안 될 때

- **Supabase → Authentication → Providers → Email**  
  **Confirm email**이 **OFF**인지 확인하세요. 켜져 있으면 이메일 인증 전까지 로그인/세션이 완료되지 않습니다.
- **Supabase → Authentication → URL Configuration**  
  **Redirect URLs**에 배포 주소(예: `https://xxx.vercel.app/**`)가 들어가 있어야 합니다. **Site URL**도 배포 주소로 맞춰 두세요.
- Vercel **Environment Variables**에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 올바르게 들어가 있는지 확인하세요.
- 화면에 **에러 메시지**가 뜨면 그 내용을 확인하면 원인 파악에 도움이 됩니다.

### 3-5. 환경 변수는 배포 쪽에만

- **시크릿 키(SUPABASE_SERVICE_ROLE_KEY)** 는 반드시 **서버만** 쓰도록 배포 플랫폼의 Environment Variables에만 넣고,  
  GitHub 등 저장소나 클라이언트 번들에는 절대 포함되지 않도록 하세요.

---

## 요약

- **API URL** → `NEXT_PUBLIC_SUPABASE_URL`  
- **퍼블리서블 키(anon)** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
- **시크릿 키(service_role)** → `SUPABASE_SERVICE_ROLE_KEY` (서버 전용, 노출 금지)  
- **테스트 계정**: 로그인 화면에서 한 번에 교사/학생으로 들어가기 위한 **선택** 기능. 사용 안 하면 해당 환경 변수 비워두면 됨.  
- **배포 후**: Supabase **Authentication → URL Configuration**에서 배포 URL을 **Redirect URLs**와 **Site URL**에 반드시 추가.
