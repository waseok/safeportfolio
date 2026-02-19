import Link from "next/link";

// SAFE 프로젝트 포트폴리오 메인 랜딩 페이지
// - 이 페이지 하나만으로 기획 의도, 핵심 기능, 기술 스택, 실제 사용 흐름을 빠르게 파악할 수 있도록 구성합니다.
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-100">
      {/* 상단 고정 네비게이션: 포트폴리오 각 섹션으로 스크롤 이동 */}
      <header className="sticky top-0 z-20 border-b border-amber-100/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6">
          {/* 좌측 로고 영역: 프로젝트 이름 + 서브 타이틀 */}
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold tracking-[0.25em] text-amber-500">
              SAFE
            </span>
            <span className="text-sm font-semibold text-amber-900 md:text-base">
              프로젝트 포트폴리오
            </span>
          </div>

          {/* 우측 네비게이션: 각 섹션으로 앵커 이동 */}
          <nav className="flex items-center gap-4 text-xs md:gap-6 md:text-sm">
            {/* 각 a 태그는 같은 페이지 내 id로 스크롤되도록 구성 */}
            <a
              href="#overview"
              className="text-amber-800/80 transition hover:text-amber-900"
            >
              개요
            </a>
            <a
              href="#features"
              className="text-amber-800/80 transition hover:text-amber-900"
            >
              핵심 기능
            </a>
            <a
              href="#tech"
              className="text-amber-800/80 transition hover:text-amber-900"
            >
              기술 스택
            </a>
            <a
              href="#flow"
              className="text-amber-800/80 transition hover:text-amber-900"
            >
              사용 흐름
            </a>
            <a
              href="#cta"
              className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-[11px] font-medium text-amber-800 shadow-sm transition hover:border-amber-400 hover:bg-amber-100 md:text-xs"
            >
              시작하기
            </a>
          </nav>
        </div>
      </header>

      {/* 메인 콘텐츠 래퍼: 가운데 정렬된 최대 너비 컨테이너 */}
      <div className="mx-auto flex max-w-5xl flex-col gap-16 px-4 pb-16 pt-10 md:gap-20 md:px-6 md:pt-16">
        {/* HERO 영역: SAFE 프로젝트의 한 줄 정의 + 주요 CTA */}
        <section
          id="hero"
          className="grid gap-10 md:grid-cols-[1.5fr,1fr] md:items-center"
        >
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
              학교 안전 교육을 위한 게이미피케이션 프로젝트
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-amber-950 md:text-4xl lg:text-5xl">
              SAFE 프로젝트 포트폴리오
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-amber-800/90 md:text-base">
              SAFE(Safety Awareness for Everyone)는
              <span className="font-semibold"> 교실 속 안전 행동을 인증하고,</span>{" "}
              <span className="font-semibold">
                피드백과 포인트 보상으로 동기를 높이는
              </span>{" "}
              웹 애플리케이션입니다. 이 페이지는 SAFE의
              기획 의도, 핵심 기능, 사용자 흐름을 한눈에 정리한
              포트폴리오입니다.
            </p>

            {/* 주요 행동 버튼들: 실제 서비스 로그인/회원가입으로 연결 */}
            <div className="flex flex-wrap items-center gap-3" id="cta">
              {/* 교사/관리자용: 로그인 페이지로 이동 */}
              <Link
                href="/login"
                className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600 hover:shadow-md"
              >
                서비스 로그인
              </Link>
              {/* 교사 회원가입 CTA */}
              <Link
                href="/signup"
                className="rounded-xl border border-amber-400 bg-white px-6 py-3 text-sm font-medium text-amber-800 shadow-sm transition hover:border-amber-500 hover:bg-amber-50"
              >
                교사 계정 만들기
              </Link>
              {/* 학생 입장 버튼: 학급 코드 기반 입장 흐름을 바로 경험 */}
              <Link
                href="/student-join"
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-800 shadow-sm transition hover:border-amber-300 hover:bg-amber-100 md:text-sm"
              >
                학생 입장 (학급코드)
              </Link>
            </div>

            {/* 간단한 요약 bullet: SAFE가 해결하는 문제를 3줄로 설명 */}
            <ul className="mt-4 grid gap-2 text-xs text-amber-800/90 md:text-sm">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                <span>수업 시간 중 관찰하기 어려운 학생의 안전 행동을 기록·시각화</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                <span>교사는 학급 단위로 안전 미션을 설계하고, 포인트로 동기 부여</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                <span>학생은 마이페이지/상점에서 자신의 성장과 보상을 직관적으로 확인</span>
              </li>
            </ul>
          </div>

          {/* 우측 요약 카드: SAFE의 구조를 한눈에 보여주는 미니 다이어그램 느낌 */}
          <div className="rounded-3xl border border-amber-100 bg-white/70 p-5 shadow-sm backdrop-blur md:p-6">
            {/* 상단 라벨 */}
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              SAFE SYSTEM
            </p>
            {/* SAFE 네 글자를 기준으로 개념 정리 */}
            <dl className="space-y-3 text-xs text-amber-900 md:text-sm">
              <div className="flex gap-3">
                <dt className="mt-0.5 h-6 w-6 flex-shrink-0 rounded-full bg-amber-100 text-center text-[11px] font-semibold leading-6 text-amber-700">
                  S
                </dt>
                <dd>
                  <span className="font-semibold">Safety Mission</span>
                  <br />
                  교사가 학급별 안전 미션과 포인트 기준을 설계합니다.
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="mt-0.5 h-6 w-6 flex-shrink-0 rounded-full bg-amber-100 text-center text-[11px] font-semibold leading-6 text-amber-700">
                  A
                </dt>
                <dd>
                  <span className="font-semibold">Awareness Feedback</span>
                  <br />
                  교사가 학생의 행동을 인증하고, 즉시 피드백을 제공합니다.
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="mt-0.5 h-6 w-6 flex-shrink-0 rounded-full bg-amber-100 text-center text-[11px] font-semibold leading-6 text-amber-700">
                  F
                </dt>
                <dd>
                  <span className="font-semibold">Fun Point System</span>
                  <br />
                  학생은 포인트와 보상을 통해 재미있게 참여합니다.
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="mt-0.5 h-6 w-6 flex-shrink-0 rounded-full bg-amber-100 text-center text-[11px] font-semibold leading-6 text-amber-700">
                  E
                </dt>
                <dd>
                  <span className="font-semibold">Evidence Dashboard</span>
                  <br />
                  마이페이지/대시보드에서 성장 데이터를 시각적으로 확인합니다.
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* 프로젝트 개요 섹션: SAFE를 한 단락으로 설명 */}
        <section id="overview" className="space-y-4">
          <h2 className="text-lg font-semibold text-amber-950 md:text-xl">
            프로젝트 개요
          </h2>
          <p className="text-sm leading-relaxed text-amber-900/90 md:text-base">
            SAFE 프로젝트는{" "}
            <span className="font-semibold">
              학교 현장에서 안전 교육이 &quot;특별 활동&quot;이 아니라
              일상적인 습관이 되도록 돕는 것
            </span>
            에 목적을 둔 웹 애플리케이션입니다. 교사는 학급별로 안전 행동
            기준을 정의하고, 학생의 실천 여부를 인증하여 포인트로 보상합니다.
            학생은 자신의 안전 행동 이력을 시각적으로 확인하고, 포인트 상점에서
            보상과 교환함으로써 자연스럽게 안전 규칙을 내면화하도록 설계했습니다.
          </p>
        </section>

        {/* 핵심 기능 섹션: 실제 구현된 화면 기준으로 요약 */}
        <section id="features" className="space-y-5">
          <h2 className="text-lg font-semibold text-amber-950 md:text-xl">
            핵심 기능 요약
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {/* 1. 교사용 기능 카드 */}
            <article className="flex flex-col justify-between rounded-2xl border border-amber-100 bg-white/70 p-4 shadow-sm">
              <div>
                <h3 className="text-sm font-semibold text-amber-900 md:text-base">
                  교사 대시보드 및 학급 관리
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-amber-800/90 md:text-sm">
                  교사는 학급을 생성하고, 학급 코드로 학생을 초대합니다.
                  학급별 안전 미션과 포인트 정책을 설정하여 수업 상황에 맞는
                  맞춤형 운영이 가능합니다.
                </p>
              </div>
              <p className="mt-3 text-[11px] font-medium text-amber-600">
                관련 화면: /login, /signup, /admin, /admin/classes
              </p>
            </article>

            {/* 2. 학생용 마이페이지 기능 카드 */}
            <article className="flex flex-col justify-between rounded-2xl border border-amber-100 bg-white/70 p-4 shadow-sm">
              <div>
                <h3 className="text-sm font-semibold text-amber-900 md:text-base">
                  학생 마이페이지 및 인벤토리
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-amber-800/90 md:text-sm">
                  학생은 학급 코드로 입장한 뒤, 자신의 포인트, 획득한 보상
                  아이템, 수행한 안전 미션 이력을 마이페이지에서 한눈에
                  확인할 수 있습니다.
                </p>
              </div>
              <p className="mt-3 text-[11px] font-medium text-amber-600">
                관련 화면: /(student)/dashboard, /(student)/mypage
              </p>
            </article>

            {/* 3. 포인트 상점 기능 카드 */}
            <article className="flex flex-col justify-between rounded-2xl border border-amber-100 bg-white/70 p-4 shadow-sm">
              <div>
                <h3 className="text-sm font-semibold text-amber-900 md:text-base">
                  포인트 상점 및 리워드
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-amber-800/90 md:text-sm">
                  학생은 누적된 포인트를 사용해 상점에서 아이템을 구매할 수
                  있으며, 교사는 상점 아이템과 가격, 재고 등을 설계하여
                  학급 문화에 맞는 보상 시스템을 만들 수 있습니다.
                </p>
              </div>
              <p className="mt-3 text-[11px] font-medium text-amber-600">
                관련 화면: /(student)/shop, /api/shop/purchase
              </p>
            </article>
          </div>
        </section>

        {/* 기술 스택 섹션: 실제 package.json 기준으로 정리 */}
        <section id="tech" className="space-y-5">
          <h2 className="text-lg font-semibold text-amber-950 md:text-xl">
            사용 기술 스택
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-amber-100 bg-white/70 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-amber-900 md:text-base">
                프론트엔드 & UI
              </h3>
              <ul className="mt-3 space-y-1.5 text-xs text-amber-800/90 md:text-sm">
                <li>
                  <span className="font-semibold">Next.js 16 (App Router)</span>{" "}
                  기반 싱글 페이지 라우팅 구조
                </li>
                <li>
                  <span className="font-semibold">React 19</span>로 상태 관리 및
                  인터랙션 구현
                </li>
                <li>
                  <span className="font-semibold">Tailwind CSS v4</span>로
                  반응형 레이아웃과 일관된 디자인 시스템 구성
                </li>
                <li>
                  <span className="font-semibold">Geist 폰트</span>로
                  가독성과 현대적인 분위기 강화
                </li>
              </ul>
            </article>

            <article className="rounded-2xl border border-amber-100 bg-white/70 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-amber-900 md:text-base">
                백엔드 & 인프라
              </h3>
              <ul className="mt-3 space-y-1.5 text-xs text-amber-800/90 md:text-sm">
                <li>
                  <span className="font-semibold">@supabase/supabase-js</span>를
                  사용한 인증 및 데이터베이스 연동
                </li>
                <li>
                  Next.js <span className="font-semibold">Route Handlers</span>
                  로 RESTful API 엔드포인트 구현
                </li>
                <li>
                  <span className="font-semibold">TypeScript</span> 기반 타입
                  안정성과 유지보수성 확보
                </li>
                <li>ESLint를 활용한 기본 코드 품질 관리 설정</li>
              </ul>
            </article>
          </div>
        </section>

        {/* 실제 사용 흐름 섹션: 교사/학생 관점에서 한눈에 시나리오 정리 */}
        <section id="flow" className="space-y-5">
          <h2 className="text-lg font-semibold text-amber-950 md:text-xl">
            사용자 흐름 요약
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-amber-100 bg-white/70 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-amber-900 md:text-base">
                교사(관리자) 플로우
              </h3>
              <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-xs text-amber-800/90 md:text-sm">
                <li>회원가입 후 로그인한다.</li>
                <li>학급을 생성하고 학급 코드를 발급한다.</li>
                <li>수업 맥락에 맞는 안전 행동 기준과 포인트 정책을 설정한다.</li>
                <li>수업 중 학생의 안전 행동을 인증하고, 피드백과 함께 기록한다.</li>
                <li>대시보드에서 학급/학생별 안전 행동 데이터를 확인하고 지도에 활용한다.</li>
              </ol>
            </article>

            <article className="rounded-2xl border border-amber-100 bg-white/70 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-amber-900 md:text-base">
                학생 플로우
              </h3>
              <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-xs text-amber-800/90 md:text-sm">
                <li>교사가 안내한 학급 코드로 학생 입장 페이지에 접속한다.</li>
                <li>이름과 번호, 학급 코드를 입력하여 학급에 참여한다.</li>
                <li>수업 중 안전 행동을 실천하고, 교사의 인증을 통해 포인트를 획득한다.</li>
                <li>마이페이지에서 나의 포인트, 히스토리, 획득 아이템을 확인한다.</li>
                <li>포인트 상점에서 원하는 보상 아이템과 교환한다.</li>
              </ol>
            </article>
          </div>
        </section>

        {/* 하단 푸터: 간단한 크레딧 및 용도 표시 */}
        <footer className="border-t border-amber-100 pt-4 text-xs text-amber-700/80 md:pt-6">
          <p>
            이 페이지는 SAFE(Safety Awareness for Everyone) 웹 애플리케이션의{" "}
            <span className="font-semibold">프로젝트 포트폴리오</span> 용도로
            작성되었습니다. 실제 서비스 화면과 기능 개선 사항은 상단 버튼을
            통해 직접 확인할 수 있습니다.
          </p>
        </footer>
      </div>
    </main>
  );
}
