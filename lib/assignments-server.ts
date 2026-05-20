import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ASSIGNMENTS,
  SAFETY_SEVEN_CATEGORIES,
  type Assignment,
} from "@/lib/assignments-data";

type DbRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  emoji: string;
  due_date: string;
  points: number;
  status: string;
};

export function rowToAssignment(row: DbRow, extras?: Partial<Assignment>): Assignment {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category as Assignment["category"],
    emoji: row.emoji || "📝",
    dueDate: row.due_date,
    points: row.points,
    status: row.status === "closed" ? "closed" : "active",
    ...extras,
  };
}

function isMissingTableError(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("safety_assignments") && (lower.includes("does not exist") || lower.includes("schema cache"));
}

/** DB 과제 목록 (없으면 lib 기본값 폴백) */
export async function fetchAssignments(
  supabase: SupabaseClient,
  opts?: { activeOnly?: boolean },
): Promise<Assignment[]> {
  let query = supabase
    .from("safety_assignments")
    .select("id, title, description, category, emoji, due_date, points, status")
    .order("sort_order", { ascending: true });

  if (opts?.activeOnly) {
    query = query.eq("status", "active");
  }

  const { data, error } = await query;

  if (error) {
    if (isMissingTableError(error.message)) {
      return ASSIGNMENTS.filter((a) => !opts?.activeOnly || a.status === "active");
    }
    console.warn("[fetchAssignments]", error.message);
    return ASSIGNMENTS.filter((a) => !opts?.activeOnly || a.status === "active");
  }

  if (!data?.length) {
    return ASSIGNMENTS.filter((a) => !opts?.activeOnly || a.status === "active");
  }

  return data.map((row) => rowToAssignment(row as DbRow));
}

/** 대시보드: 7대 영역별 진행 중 과제 1개씩 */
export async function fetchActiveAssignmentsByCategory(
  supabase: SupabaseClient,
): Promise<Assignment[]> {
  const all = await fetchAssignments(supabase, { activeOnly: true });
  return SAFETY_SEVEN_CATEGORIES.map((cat) =>
    all.find((a) => a.category === cat && a.status === "active"),
  ).filter((a): a is Assignment => Boolean(a));
}

/** 교사 화면: 제출 수 집계 */
export async function countSubmissionsByAssignmentTitle(
  supabase: SupabaseClient,
  assignments: Assignment[],
): Promise<Assignment[]> {
  const { data: posts } = await supabase
    .from("gallery_posts")
    .select("description, category");

  if (!posts?.length) {
    return assignments.map((a) => ({ ...a, submissionCount: 0, totalStudents: 24 }));
  }

  return assignments.map((a) => {
    const submissionCount = posts.filter((p) => {
      const desc = p.description ?? "";
      if (desc.includes(`【${a.title}】`)) return true;
      return p.category === a.category && desc.includes(a.title);
    }).length;
    return { ...a, submissionCount, totalStudents: 24 };
  });
}
