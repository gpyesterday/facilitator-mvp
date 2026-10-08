import Link from "next/link";
import { notFound } from "next/navigation";
import { getData, getUserById } from "@/lib/store";
import { RegisterFacilitatorForm } from "@/components/RegisterFacilitatorForm";

interface Props {
  searchParams: { userId?: string };
}

export default async function AdminPage({ searchParams }: Props) {
  const { userId } = searchParams;
  if (!userId) notFound();

  const user = await getUserById(userId);
  if (!user || user.role !== "admin") notFound();

  const data = await getData();
  const facilitators = data.users.filter((u) => u.role === "facilitator");

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
        {/* 퍼실리테이터 등록 */}
        <section>
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
            퍼실리테이터 관리
          </h2>
          <RegisterFacilitatorForm />
        </section>

        {/* 등록된 퍼실리테이터 목록 */}
        <section>
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
            등록된 퍼실리테이터 ({facilitators.length}명)
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">
                    이름
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">
                    닉네임
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">
                    이메일
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">
                    휴대전화
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">
                    담당 그룹
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facilitators.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-slate-400"
                    >
                      등록된 퍼실리테이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  facilitators.map((fac) => {
                    const group = data.groups.find(
                      (g) => g.facilitatorId === fac.id
                    );
                    return (
                      <tr key={fac.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-900 font-medium">
                          {fac.name}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {fac.nickname ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{fac.email}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {fac.phone ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {group?.name ?? (
                            <span className="text-slate-400">미배정</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Groups */}
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
                            Stage{" "}
                            {p?.currentStage === 4 ? "수료" : p?.currentStage}
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

        {/* Stages overview */}
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
      </main>
    </div>
  );
}
