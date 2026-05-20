/** 7대 안전 영역별 과제 */
export type Assignment = {
  id: string;
  title: string;
  description: string;
  /** 7대 안전 구분 */
  category: (typeof SAFETY_SEVEN_CATEGORIES)[number];
  emoji: string;
  dueDate: string;
  points: number;
  status: "active" | "closed";
  /** 관리자 통계용 (선택). 학생 화면에는 표시하지 않음 */
  submissionCount?: number;
  totalStudents?: number;
};

/** 7대 안전 과목명 (표준 분류 순서) */
export const SAFETY_SEVEN_CATEGORIES = [
  "생활안전",
  "교통안전",
  "폭력예방",
  "중독예방",
  "재난안전",
  "직업안전",
  "응급처치",
] as const;

export const CATEGORY_CARD_THEME: Record<
  string,
  { border: string; bg: string; chip: string; accent: string }
> = {
  생활안전: {
    border: "border-l-emerald-600",
    bg: "bg-emerald-50/90",
    chip: "bg-emerald-100 text-emerald-900 border-emerald-300",
    accent: "from-emerald-500 to-teal-600",
  },
  교통안전: {
    border: "border-l-sky-600",
    bg: "bg-sky-50/90",
    chip: "bg-sky-100 text-sky-900 border-sky-300",
    accent: "from-sky-500 to-blue-600",
  },
  폭력예방: {
    border: "border-l-rose-600",
    bg: "bg-rose-50/90",
    chip: "bg-rose-100 text-rose-900 border-rose-300",
    accent: "from-rose-500 to-pink-600",
  },
  중독예방: {
    border: "border-l-indigo-600",
    bg: "bg-indigo-50/90",
    chip: "bg-indigo-100 text-indigo-900 border-indigo-300",
    accent: "from-indigo-500 to-violet-600",
  },
  재난안전: {
    border: "border-l-amber-600",
    bg: "bg-amber-50/90",
    chip: "bg-amber-100 text-amber-900 border-amber-300",
    accent: "from-amber-500 to-yellow-600",
  },
  직업안전: {
    border: "border-l-orange-600",
    bg: "bg-orange-50/90",
    chip: "bg-orange-100 text-orange-900 border-orange-300",
    accent: "from-orange-500 to-red-600",
  },
  응급처치: {
    border: "border-l-violet-600",
    bg: "bg-violet-50/90",
    chip: "bg-violet-100 text-violet-900 border-violet-300",
    accent: "from-violet-500 to-purple-600",
  },
};

/** 마감일: 2026년 6월 일정 — 영역별 1개씩 */
export const ASSIGNMENTS: Assignment[] = [
  {
    id: "assign-3",
    title: "생활 안전 수칙 포스터 만들기",
    description:
      "우리 가족·학급에서 꼭 지키면 좋은 생활 안전 수칙 3가지를 정해 손글씨 포스터로 만들어 보세요. 완성된 포스터를 인증샷으로 올려주세요.",
    category: "생활안전",
    emoji: "✏️",
    dueDate: "2026-06-08",
    points: 15,
    status: "active",
  },
  {
    id: "assign-1",
    title: "등하교 교통안전 실천 인증",
    description:
      "등·하교 길 횡단보도 신호 지키기, 인도 걷기, 자전거 헬멧 착용 등 교통안전 규칙을 하나 이상 실천하고 인증샷을 올려주세요. 설명란에 지킨 규칙을 적어주세요.",
    category: "교통안전",
    emoji: "🚦",
    dueDate: "2026-06-10",
    points: 10,
    status: "active",
  },
  {
    id: "assign-7",
    title: "학교 폭력 예방 동료 돌봄 실천",
    description:
      "친구를 존중하는 말 한마디, 왕따 방지 캠페인 포스터 만들기 등 폭력 예방 활동을 실천하고 사진으로 남겨 주세요.",
    category: "폭력예방",
    emoji: "🤝",
    dueDate: "2026-06-12",
    points: 16,
    status: "active",
  },
  {
    id: "assign-5",
    title: "중독·사이버 예방 서약 실천",
    description:
      "게임·SNS 과다 사용 줄이기, 개인정보 보호, 약물·사이버 중독 예방 다짐을 손글씨로 쓰거나 그림으로 표현해 인증샷을 올려주세요.",
    category: "중독예방",
    emoji: "💻",
    dueDate: "2026-06-15",
    points: 12,
    status: "active",
  },
  {
    id: "assign-6",
    title: "지진·태풍 대비 가방 점검",
    description:
      "비상용 손전등, 물, 간단한 약 등 우리 집·교실 비상 물품을 점검하는 모습을 인증해 주세요. 부족한 것이 있다면 메모해 두면 좋아요.",
    category: "재난안전",
    emoji: "🌧️",
    dueDate: "2026-06-18",
    points: 14,
    status: "active",
  },
  {
    id: "assign-2",
    title: "직업·실습 안전 수칙 인증",
    description:
      "미술·실과·과학 실습 등 학교 활동에서 도구·기구를 안전하게 사용하는 모습, 또는 직업 안전 수칙 포스터를 만들어 인증샷을 올려주세요.",
    category: "직업안전",
    emoji: "⚙️",
    dueDate: "2026-06-22",
    points: 12,
    status: "active",
  },
  {
    id: "assign-4",
    title: "응급 상황 대처 역할극·인증",
    description:
      "심폐소생술 순서를 말로 설명하거나 인형·쿠션으로 가슴 압박 연습하는 모습을 인증해 주세요. 보건·안전 영상을 참고해도 좋아요.",
    category: "응급처치",
    emoji: "🏥",
    dueDate: "2026-06-30",
    points: 18,
    status: "active",
  },
];
