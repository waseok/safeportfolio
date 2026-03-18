import { ASSIGNMENTS } from "@/lib/assignments-data";
import Link from "next/link";

const CATEGORY_COLORS: Record<string, string> = {
  교통안전: "bg-blue-100 text-blue-800 border-blue-300",
  화재안전: "bg-red-100 text-red-800 border-red-300",
  생활안전: "bg-green-100 text-green-800 border-green-300",
  응급처치: "bg-purple-100 text-purple-800 border-purple-300",
  사이버예방: "bg-indigo-100 text-indigo-800 border-indigo-300",
  재난안전: "bg-yellow-100 text-yellow-800 border-yellow-300",
  폭력예방: "bg-pink-100 text-pink-800 border-pink-300",
};

export default function AssignmentsPage() {
  const activeAssignments = ASSIGNMENTS.filter((a) => a.status === "active");

  return (
    <main className="space-y-6">
      {/* 히어로 */}
      <section
        className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl"
        style={{ background: "linear-gradient(135deg, #065f46 0%, #059669 60%, #34d399 100%)" }}
      >
        <div className="absolute right-0 top-0 text-[120px] opacity-10 select-none pointer-events-none">📝</div>
        <div className="absolute inset-0 bg-black/10 pointer-events-none rounded-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1 mb-2 border border-white/20">
            <span className="text-xs font-bold text-white tracking-widest">🤝 함께 만드는 안전과제</span>
          </div>
          <h1 className="text-2xl font-black text-white drop-shadow-sm">안전 과제에 도전해보세요!</h1>
          <p className="mt-1 text-sm text-emerald-100">
            선생님이 만든 안전 과제를 확인하고, 직접 실천한 뒤 인증샷을 올리면 포인트를 받을 수 있어요.
          </p>
          <div className="mt-4 flex gap-3">
            <div className="rounded-xl bg-white/20 px-4 py-2 text-center border border-white/30">
              <p className="text-xl font-black">{activeAssignments.length}</p>
              <p className="text-xs text-emerald-100">진행중 과제</p>
            </div>
            <div className="rounded-xl bg-white/20 px-4 py-2 text-center border border-white/30">
              <p className="text-xl font-black">
                {activeAssignments.reduce((s, a) => s + a.points, 0)}P
              </p>
              <p className="text-xs text-emerald-100">획득 가능 포인트</p>
            </div>
          </div>
        </div>
      </section>

      {/* 과제 방법 안내 */}
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <h2 className="font-black text-emerald-900 mb-3">📌 과제 참여 방법</h2>
        <div className="grid gap-2 sm:grid-cols-3 text-sm">
          <div className="flex items-start gap-2 bg-white rounded-xl p-3 border border-emerald-100 shadow-sm">
            <span className="text-2xl flex-shrink-0">1️⃣</span>
            <div>
              <p className="font-bold text-emerald-900">과제 확인</p>
              <p className="text-xs text-emerald-700 mt-0.5">아래에서 진행중인 과제 내용을 읽어보세요.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-white rounded-xl p-3 border border-emerald-100 shadow-sm">
            <span className="text-2xl flex-shrink-0">2️⃣</span>
            <div>
              <p className="font-bold text-emerald-900">직접 실천</p>
              <p className="text-xs text-emerald-700 mt-0.5">과제에서 요구하는 안전 활동을 직접 해보세요.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-white rounded-xl p-3 border border-emerald-100 shadow-sm">
            <span className="text-2xl flex-shrink-0">3️⃣</span>
            <div>
              <p className="font-bold text-emerald-900">인증샷 제출</p>
              <p className="text-xs text-emerald-700 mt-0.5">인증샷 올리기에서 카테고리를 맞춰 사진을 올리면 포인트 지급!</p>
            </div>
          </div>
        </div>
      </section>

      {/* 과제 목록 */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-gray-800">📋 진행중인 과제</h2>
        {activeAssignments.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
            <p className="text-3xl mb-2">🎉</p>
            <p className="font-bold">현재 진행중인 과제가 없어요!</p>
            <p className="text-sm mt-1">선생님이 새 과제를 등록하면 여기에 표시돼요.</p>
          </div>
        ) : (
          activeAssignments.map((assignment) => {
            const isNearDue =
              new Date(assignment.dueDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;
            const catColor =
              CATEGORY_COLORS[assignment.category] ?? "bg-gray-100 text-gray-800 border-gray-300";

            return (
              <div
                key={assignment.id}
                className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl shadow-sm">
                      {assignment.emoji}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-black text-slate-900 text-base">{assignment.title}</h3>
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${catColor}`}>
                          {assignment.category}
                        </span>
                        {isNearDue && (
                          <span className="rounded-full bg-red-100 border border-red-300 text-red-600 px-2 py-0.5 text-xs font-bold animate-pulse">
                            ⚡ 마감 임박
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{assignment.description}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                        <span>📅 마감일: <strong className="text-slate-700">{assignment.dueDate}</strong></span>
                        <span>⭐ 포인트: <strong className="text-emerald-600">{assignment.points}P</strong></span>
                        <span>👥 제출: <strong className="text-slate-700">{assignment.submissionCount}/{assignment.totalStudents}명</strong></span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/upload?assignment=${encodeURIComponent(assignment.title)}&category=${encodeURIComponent(assignment.category)}`}
                    className="flex-shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-black text-white shadow-md hover:opacity-90 transition"
                    style={{ background: "linear-gradient(135deg, #065f46, #059669)" }}
                  >
                    📷 인증샷 제출
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* 안내 */}
      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-bold mb-1">💡 알아두세요</p>
        <ul className="space-y-1 text-xs list-disc list-inside text-blue-700">
          <li>인증샷을 올린 후 선생님이 확인하면 포인트가 지급돼요.</li>
          <li>
            인증샷 올리기에서 설명란에 과제 이름을 꼭 적어주세요!
          </li>
          <li>마감일 전에 제출해야 포인트를 받을 수 있어요.</li>
        </ul>
      </section>
    </main>
  );
}
