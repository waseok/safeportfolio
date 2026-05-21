/** 업로드 시 description 앞에 붙는 과제 제목 【...】 파싱 */
export function parseAssignmentTitle(description: string | null | undefined): string | null {
  if (!description?.trim()) return null;
  const match = description.trim().match(/^【([^】]+)】/);
  return match?.[1]?.trim() ?? null;
}

/** 과제 제목 접두어를 제외한 학생 활동 설명 */
export function parseUserNote(description: string | null | undefined): string | null {
  if (!description?.trim()) return null;
  const note = description.trim().replace(/^【[^】]+】\n?/, "").trim();
  return note || null;
}
