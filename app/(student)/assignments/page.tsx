import { CATEGORY_CARD_THEME } from "@/lib/assignments-data";
import { fetchAssignments } from "@/lib/assignments-server";
import { createServiceClient } from "@/lib/supabase/server";
import { AssignmentSuggestionForm } from "@/components/assignment-suggestion-form";
import Link from "next/link";

export default async function AssignmentsPage() {
  const supabase = createServiceClient();
  const activeAssignments = (await fetchAssignments(supabase, { activeOnly: true })).filter(
    (a) => a.status === "active",
  );
  const totalPointPool = activeAssignments.reduce((s, a) => s + a.points, 0);

  return (
    <main className="space-y-7">
      {/* 히어로 — 파란 톤 */}
      <section
        className="relative overflow-hidden rounded-3xl p-7 text-white shadow-xl"
        style={{
          background: "linear-gradient(135deg, #0369a1 0%, #0284c7 45%, #38bdf8 100%)",
        }}
      >
        <div className="absolute right-0 top-0 text-[120px] opacity-15 select-none pointer-events-none">🛡️</div>
        <div className="absolute inset-0 bg-black/10 pointer-events-none rounded-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 mb-3 border border-white/30">
            <span className="text-sm font-bold text-white tracking-widest">
              🤝 함께 만드는 안전과제
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">
            안전 과제에 도전해보세요!
          </h1>
          <p className="mt-2 text-base font-medium text-sky-100 leading-relaxed">
            7대 안전 영역을 모두 다루는 과제예요. 실천 후 인증샷을 올리면 선생님 확인 뒤 포인트를 받을 수 있어요.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="rounded-xl bg-white/20 px-5 py-2.5 text-center border border-white/30">
              <p className="text-2xl font-extrabold">{activeAssignments.length}</p>
              <p className="text-sm font-medium text-sky-100">진행 중 과제</p>
            </div>
            <div className="rounded-xl bg-white/20 px-5 py-2.5 text-center border border-white/30">
              <p className="text-2xl font-extrabold">{totalPointPool}P</p>
              <p className="text-sm font-medium text-sky-100">획득 가능 포인트(합산)</p>
            </div>
          </div>
        </div>
      </section>

      <AssignmentSuggestionForm variant="card" />

      {/* 과제 방법 안내 — 스카이 톤 */}
      <section className="rounded-2xl border border-sky-200 bg-sky-50/80 p-5">
        <h2 className="font-extrabold text-sky-950 mb-4 text-lg">📌 과제 참여 방법</h2>
        <div className="grid gap-3 sm:grid-cols-3 text-base">
          {[
            ["1️⃣", "과제 확인", "아래 목록에서 우리 영역(7대 안전) 과제를 읽어요."],
            ["2️⃣", "직접 실천", "집·학교에서 안전 활동을 직접 해봐요."],
            ["3️⃣", "인증샷 제출", "「안전 과제 올리기」에서 인증샷을 올려요."],
          ].map(([emo, title, desc]) => (
            <div
              key={title}
              className="flex items-start gap-2 bg-white rounded-xl p-4 border border-sky-100 shadow-sm"
            >
              <span className="text-2xl flex-shrink-0">{emo}</span>
              <div>
                <p className="font-bold text-sky-950">{title}</p>
                <p className="text-sm font-medium text-sky-900/80 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 과제 목록 — 7대 안전별 색 구분 */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900">📋 진행중인 과제 (7대 안전)</h2>
        {activeAssignments.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-10 text-center text-gray-500">
            <p className="text-4xl mb-2">🎉</p>
            <p className="font-bold text-lg">현재 진행중인 과제가 없어요!</p>
          </div>
        ) : (
          activeAssignments.map((assignment) => {
            const theme =
              CATEGORY_CARD_THEME[assignment.category] ?? CATEGORY_CARD_THEME["교통안전"];
            const isNearDue =
              new Date(assignment.dueDate).getTime() - Date.now() < 5 * 24 * 60 * 60 * 1000;

            return (
              <div
                key={assignment.id}
                className={`rounded-2xl border border-slate-200 border-l-[6px] ${theme.border} ${theme.bg} p-6 shadow-sm hover:shadow-md transition`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div
                      className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm bg-gradient-to-br ${theme.accent} text-white`}
                    >
                      {assignment.emoji}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="font-extrabold text-slate-900 text-lg">{assignment.title}</h3>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${theme.chip}`}
                        >
                          {assignment.category}
                        </span>
                        {isNearDue && (
                          <span className="rounded-full bg-red-100 border border-red-300 text-red-700 px-2 py-0.5 text-xs font-extrabold animate-pulse">
                            ⚡ 마감 임박
                          </span>
                        )}
                      </div>
                      <p className="text-base font-medium text-slate-700 leading-relaxed">
                        {assignment.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium text-slate-600">
                        <span>
                          📅 마감일:{" "}
                          <strong className="text-slate-900">{assignment.dueDate}</strong>
                        </span>
                        <span>
                          ⭐ 포인트:{" "}
                          <strong className="text-sky-700">{assignment.points}P</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/upload?assignment=${encodeURIComponent(assignment.title)}&category=${encodeURIComponent(assignment.category)}`}
                    className={`flex-shrink-0 flex items-center gap-1.5 rounded-xl px-5 py-3 text-sm font-extrabold text-white shadow-md hover:opacity-92 transition bg-gradient-to-r ${theme.accent}`}
                  >
                    📷 인증샷 제출
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </section>

      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-950">
        <p className="font-extrabold mb-2 text-base">💡 알아두세요</p>
        <ul className="space-y-2 text-sm font-medium list-disc list-inside leading-relaxed text-blue-900/90">
          <li>인증샷을 올린 뒤 선생님이 확인·승인하면 포인트가 지급돼요.</li>
          <li>설명란에 과제 이름과 어떤 안전을 실천했는지 적어 주세요.</li>
          <li>마감일 전에 제출해야 포인트를 받을 수 있어요.</li>
        </ul>
      </section>
    </main>
  );
}
