export type Assignment = {
  id: string;
  title: string;
  description: string;
  category: string;
  emoji: string;
  dueDate: string;
  points: number;
  status: "active" | "closed";
  submissionCount: number;
  totalStudents: number;
};

export const ASSIGNMENTS: Assignment[] = [
  {
    id: "assign-1",
    title: "등하교 교통안전 실천 인증",
    description:
      "등교 또는 하교 시 횡단보도에서 초록불 확인 후 건너는 모습, 인도 이용, 헬멧 착용(자전거 등) 중 하나를 실천하고 인증샷을 올려주세요. 사진 설명란에 어떤 안전 규칙을 지켰는지 써주세요!",
    category: "교통안전",
    emoji: "🚦",
    dueDate: "2026-03-28",
    points: 10,
    status: "active",
    submissionCount: 14,
    totalStudents: 24,
  },
  {
    id: "assign-2",
    title: "화재 대피 훈련 소감 & 인증",
    description:
      "이번 달 화재 대피 훈련에 참여한 후, 훈련 중 자신이 지킨 행동(코·입 막기, 낮은 자세 유지 등)을 기억하며 그 모습이나 소화기 위치를 인증샷으로 남겨보세요. 사진 설명란에 느낀 점도 꼭 적어주세요.",
    category: "화재안전",
    emoji: "🧯",
    dueDate: "2026-03-31",
    points: 15,
    status: "active",
    submissionCount: 7,
    totalStudents: 24,
  },
  {
    id: "assign-3",
    title: "나만의 안전 수칙 포스터 만들기",
    description:
      "생활 속에서 꼭 지켜야 할 안전 수칙 3가지를 직접 정해 손으로 쓴 포스터나 카드를 만들어보세요. 창의적으로 꾸며도 좋아요! 완성된 포스터를 인증샷으로 올리면 포인트를 드려요.",
    category: "생활안전",
    emoji: "✏️",
    dueDate: "2026-04-04",
    points: 20,
    status: "active",
    submissionCount: 3,
    totalStudents: 24,
  },
  {
    id: "assign-4",
    title: "심폐소생술(CPR) 연습 인증",
    description:
      "보건 선생님 영상이나 교과서를 보고 심폐소생술 순서(의식 확인 → 119 신고 → 가슴 압박 → 인공호흡)를 익힌 뒤, 인형이나 쿠션 등으로 연습하는 모습을 인증샷으로 찍어 올려보세요.",
    category: "응급처치",
    emoji: "🏥",
    dueDate: "2026-04-11",
    points: 20,
    status: "active",
    submissionCount: 0,
    totalStudents: 24,
  },
];
