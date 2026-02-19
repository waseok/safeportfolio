/** 클라이언트/서버 공용: 역할 타입과 리다이렉트 경로 (서버 DB 미사용) */
export type Role = "student" | "teacher";

export function getRedirectPath(role: Role): string {
  return role === "teacher" ? "/admin" : "/dashboard";
}
