import { getCurrentUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminItemsClient } from "./admin-items-client";

export default async function AdminItemsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "teacher") redirect("/dashboard");

  // 서비스 클라이언트: RLS 재귀 hang 방지
  const supabase = createServiceClient();
  const { data: items } = await supabase
    .from("items")
    .select("id, name, type, price, image_url, is_active")
    .order("price", { ascending: true });

  return (
    <div className="space-y-6">
      <h1 className="text-[1.75rem] font-bold text-slate-800">상점 아이템 관리</h1>
      <p className="text-base text-slate-700">
        학생들이 포인트로 구매할 수 있는 아바타·뱃지 등 아이템을 등록하고 가격·노출 여부를 관리합니다.
      </p>
      <AdminItemsClient initialItems={items ?? []} />
    </div>
  );
}
