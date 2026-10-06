import Link from "next/link";
import { notFound } from "next/navigation";
import { getData, getUserById } from "@/lib/store";

interface Props {
  searchParams: { userId?: string };
}

export default async function AdminPage({ searchParams }: Props) {
  const { userId } = searchParams;
  if (!userId) notFound();

  const user = await getUserById(userId);
  if (!user || user.role !== "admin") notFound();

  const data = await getData();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">관리자 화면</h1>
            <p className="text-sm text-slate-500">{user.name}</p>
          </div>
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-800"
          >
            나가기
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <section>
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
            그룹 현황
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.groups.map((group) => {
              const facilitator = data.users.find(
                (u) => u.id === group.facilitatorId
              );
              const learners = data.users.filter(
                (u) => u.role === "learner" && u.groupId === group.id
              );
              return (
                <div
                  key={group.id}
                  className="bg-white rounded-xl border border-slate-200 p-5"
                >
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {group.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-3">
                    담당: {facilitator?.name ?? "미배정"}
                  </p>
                  <div className="text-sm text-slate-500">
                    학습자 {learners.length}명
                  </div>
                  <ul className="mt-2 space-y-1">
                    {learners.map((l) => {
                      const p = data.progresses.find(
                        (pr) => pr.learnerId === l.id
                      );
                      return (
                        <li
                          key={l.id}
                          className="text-sm flex justify-between text-slate-700"
                        >
                          <span>{l.name}</span>
                          <span className="text-slate-400">
                            Stage {p?.currentStage === 4 ? "수료" : p?.currentStage}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
            학습 로드맵 (3단계)
          </h2>
          <div className="space-y-3">
            {data.stages.map((stage) => (
              <div
                key={stage.id}
                className="bg-white rounded-xl border border-slate-200 p-5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                    {stage.order}
                  </span>
                  <h3 className="font-semibold text-slate-900">
                    {stage.title}
                  </h3>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  {stage.description}
                </p>
                <div className="text-xs text-slate-500">
                  자료 {stage.materials.length}개 · 통과 조건:{" "}
                  {stage.passCondition.slice(0, 60)}...
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="text-sm text-slate-400 text-center">
          ※ 이번 MVP에서는 그룹/단계 편집 기능은 포함하지 않았습니다.  
          (데이터는 <code className="bg-slate-100 px-1 rounded">src/data/mock.ts</code> 에서 수정 가능)
        </p>
      </main>
    </div>
  );
}
