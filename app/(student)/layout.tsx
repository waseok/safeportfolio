import { getCurrentUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StudentSidebar } from "./student-sidebar";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "teacher") redirect("/admin");

  const supabase = createServiceClient();
  let equippedItem: {
    image_url: string | null;
    type: string;
    name: string;
  } | null = null;
  if (user.equipped_avatar_id) {
    const { data: row } = await supabase
      .from("items")
      .select("image_url, type, name")
      .eq("id", user.equipped_avatar_id)
      .maybeSingle();
    if (row) {
      equippedItem = {
        image_url: row.image_url,
        type: row.type,
        name: row.name,
      };
    }
  }

  return (
    <div className="relative flex min-h-screen">
      <StudentSidebar
        userName={user.name}
        currentPoints={user.current_points}
        equippedItem={equippedItem}
      />

      <main className="relative flex-1 overflow-y-auto p-4 pb-24 pt-16 lg:p-10 lg:pb-10 lg:pt-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-[0.42]"
          style={{ backgroundImage: "url(/images/site-bg-illustration.png)" }}
        />
        {/* 로그인보다 살짝 덜 어둡게: 일러스트가 더 보이도록 흰색 덮개를 낮춤 */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-white/52" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-sky-50/45" />
        <div className="relative z-0 mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
