# SAFE (Safety Awareness for Everyone)

학생 안전 인증·교사 피드백·포인트 상점 웹앱 (Next.js + Supabase).

## 사전 준비

1. **Supabase** 프로젝트 생성 후 [`supabase/README.md`](supabase/README.md)와 [`supabase/schema.sql`](supabase/schema.sql)로 테이블·RLS·Storage 버킷(`cert-images`) 설정.
2. **환경 변수**: `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, (서버용) `SUPABASE_SERVICE_ROLE_KEY` 설정. 예시는 [.env.example](.env.example) 참고. **Supabase 키 매핑·테스트 계정·배포 후 설정**은 [docs/SUPABASE-SETUP.md](docs/SUPABASE-SETUP.md) 참고.
3. (선택) 샘플 아이템: Supabase SQL Editor에서 `supabase/seed-items.sql` 실행.

## Getting Started

개발 서버 실행:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 배포 (Vercel)

### Git 연동 후 자동 배포 (권장)

코드 수정 사항은 **Git에 push해야** Vercel에 반영됩니다. Vercel과 GitHub를 연동해 두면 **push할 때마다 자동으로 재배포**됩니다.

1. **GitHub에 저장소 만들기**  
   이 프로젝트를 GitHub에 올려두세요 (아직이라면 `git init` → GitHub에서 새 저장소 생성 → `git remote add origin ...` → `git push -u origin main`).

2. **Vercel과 GitHub 연동**  
   - [Vercel](https://vercel.com) 로그인 → **Add New** → **Project**
   - **Import Git Repository**에서 GitHub 계정 연결(처음이면 권한 허용)
   - 이 프로젝트 **저장소 선택** → **Import**
   - 환경 변수 설정 후 **Deploy** 한 번 실행

3. **이후 자동 배포**  
   `main`(또는 설정한 Production Branch)에 push할 때마다 Vercel이 자동으로 새 배포를 시작합니다.  
   **Settings → Git**에서 연결된 저장소·브랜치를 확인할 수 있습니다.

### 환경 변수

프로젝트 **Settings → Environment Variables**에서 다음을 추가:

| 이름 | 설명 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key (API·학급 생성 등 서버 전용) |

(선택) 테스트 계정:  
`NEXT_PUBLIC_TEST_TEACHER_EMAIL`, `NEXT_PUBLIC_TEST_TEACHER_PASSWORD`,  
`NEXT_PUBLIC_TEST_STUDENT_EMAIL`, `NEXT_PUBLIC_TEST_STUDENT_PASSWORD`

### Supabase URL 허용

Supabase Dashboard → **Authentication** → **URL Configuration** → **Redirect URLs**에  
`https://당신프로젝트.vercel.app/**` 를 추가하면 로그인/회원가입이 정상 동작합니다.

### 로컬 수정 → 자동 배포 (watch-push)

로컬에서 파일을 수정할 때마다 **자동으로 Git push → Vercel 배포**가 되게 하려면:

1. 터미널을 하나 열고 프로젝트 폴더에서 다음을 실행해 두세요.
   ```bash
   npm run watch-push
   ```
2. Cursor에서 코드를 수정·저장하면 **15초마다** 변경 여부를 확인해, 변경이 있으면 `git add` → `git commit` → `git push origin main`을 자동 실행합니다.
3. push가 완료되면 Vercel이 GitHub를 감지해 새 배포를 시작합니다. (중지: 해당 터미널에서 `Ctrl+C`)

> 처음 한 번은 `git config user.name` / `git config user.email` 설정과 `git remote add origin`이 되어 있어야 합니다.

### 수정 후 GitHub 푸시 (배포 반영)

코드를 수정했으면 **아래 명령어로 푸시**해야 Vercel에 반영됩니다. (한 번에 한 줄씩 실행)

```powershell
cd C:\curcor\safeportfolio
git add .
git commit -m "수정 내용 한 줄 요약"
git push origin main
```

- `git commit -m "..."` 안의 메시지는 이번에 뭘 바꿨는지 적으면 됩니다. (예: `fix: 회원가입 오류 수정`)
- push가 끝나면 Vercel이 자동으로 새 배포를 시작합니다.

### 코드 수정 후 배포가 안 바뀌는 경우

- 위 **푸시 명령어**를 실행했는지 확인하세요.
- Vercel 대시보드 **Deployments**에서 새 배포가 생성됐는지 확인하세요.
- 수동 배포만 했다면 Git과 연동되지 않은 상태일 수 있으므로, 위 **Git 연동** 절차대로 GitHub 저장소를 연결한 뒤 push로 배포하세요.
