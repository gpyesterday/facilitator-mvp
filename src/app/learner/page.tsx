import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getData,
  getProgress,
  getStages,
  getUserById,
  getGroupById,
  syncStagesFromMock,
} from "@/lib/store";
import { SubmitButton } from "@/components/SubmitButton";

interface Props {
  searchParams: { userId?: string };
}

export default async function LearnerPage({ searchParams }: Props) {
  const { userId } = searchParams;
  if (!userId) notFound();

  const user = await getUserById(userId);
  if (!user || user.role !== "learner") notFound();

  const progress = await getProgress(userId);
  await syncStagesFromMock();
  const stages = await getStages();
  const group = user.groupId ? await getGroupById(user.groupId) : null;
  const data = await getData();
  const facilitator = group
    ? data.users.find((u) => u.id === group.facilitatorId)
    : null;

  if (!progress) notFound();

  const currentStage =
    progress.currentStage <= 3
      ? stages.find((s) => s.order === progress.currentStage)
      : null;

  const isCompleted = progress.currentStage === 4;

  const statusLabel: Record<string, string> = {
    in_progress: "학습 중",
    submitted: "승인 대기 중",
    passed: "통과",
    rejected: "반려됨",
  };

  const statusColor: Record<string, string> = {
    in_progress: "bg-slate-100 text-slate-700",
    submitted: "bg-amber-100 text-amber-800",
    passed: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">학습자 대시보드</h1>
            <p className="text-sm text-slate-500">
              {user.name} · {group?.name ?? "그룹 미배정"}
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-800"
          >
            나가기
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Progress Overview */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-medium text-slate-500 mb-4">
            나의 학습 진행 상황
          </h2>

          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((step) => {
              const isActive = progress.currentStage === step;
              const isDone = progress.currentStage > step;
              return (
                <div key={step} className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                      isDone
                        ? "bg-emerald-500 text-white"
                        : isActive
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isDone ? "✓" : step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-8 h-0.5 ${
                        progress.currentStage > step
                          ? "bg-emerald-400"
                          : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
            {isCompleted && (
              <span className="ml-2 text-sm font-medium text-emerald-600">
                전체 수료 🎉
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                statusColor[progress.status]
              }`}
            >
              {statusLabel[progress.status]}
            </span>
            {progress.note && (
              <span className="text-sm text-slate-500">
                피드백: {progress.note}
              </span>
            )}
          </div>
        </section>

        {/* Learning Roadmap */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-medium text-slate-500 mb-4">
            학습 로드맵
          </h2>
          <div className="space-y-3">
            {stages.map((stage) => {
              const isCurrent = progress.currentStage === stage.order;
              const isDone = progress.currentStage > stage.order;
              const isLocked = progress.currentStage < stage.order;

              return (
                <div
                  key={stage.id}
                  className={`rounded-xl border p-4 transition ${
                    isCurrent
                      ? "border-indigo-300 bg-indigo-50/50"
                      : isDone
                      ? "border-emerald-200 bg-emerald-50/30"
                      : "border-slate-200 bg-slate-50/50 opacity-70"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        isDone
                          ? "bg-emerald-500 text-white"
                          : isCurrent
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {isDone ? "✓" : stage.order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`font-semibold ${
                            isCurrent
                              ? "text-indigo-900"
                              : isDone
                              ? "text-emerald-900"
                              : "text-slate-600"
                          }`}
                        >
                          {stage.title}
                        </h3>
                        {isCurrent && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                            현재 단계
                          </span>
                        )}
                        {isDone && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            완료
                          </span>
                        )}
                        {isLocked && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-500">
                            잠김
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {stage.description}
                      </p>

                      {/* Materials — only show for current or done stages */}
                      {!isLocked && stage.materials.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {stage.materials.map((m, idx) => {
                            const isInternal = m.url.startsWith("/");
                            return (
                              <a
                                key={idx}
                                href={m.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 transition text-slate-800"
                              >
                                <span className="text-indigo-500">
                                  {isInternal ? "📘" : "📄"}
                                </span>
                                <span className="font-medium text-sm">
                                  {m.title}
                                </span>
                                <span className="text-xs text-slate-400 ml-auto">
                                  {isInternal ? "가이드 열기 →" : "외부 링크"}
                                </span>
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Current Stage Detail + Submit */}
        {isCompleted ? (
          <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">🎓</div>
            <h2 className="text-xl font-bold text-emerald-900 mb-2">
              축하합니다! 모든 단계를 수료했습니다.
            </h2>
            <p className="text-emerald-700">
              수고하셨습니다. 담당 퍼실리테이터에게 최종 피드백을 받아보세요.
            </p>
          </section>
        ) : currentStage ? (
          <section className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="mb-4">
              <span className="text-xs font-medium text-indigo-600">
                STAGE {currentStage.order}
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {currentStage.title}
              </h2>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-1">
                통과 조건
              </h3>
              <p className="text-sm text-slate-600">
                {currentStage.passCondition}
              </p>
            </div>

            {progress.status === "in_progress" && progress.note && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm mb-4">
                이전 제출이 반려되었습니다. 피드백을 반영한 뒤 다시 제출해 주세요.
                <p className="mt-2 font-medium">피드백: {progress.note}</p>
              </div>
            )}

            {progress.status === "in_progress" && (
              <SubmitButton learnerId={userId} />
            )}

            {progress.status === "submitted" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
                제출이 완료되었습니다. 담당 퍼실리테이터(
                {facilitator?.name ?? "미배정"})의 승인을 기다리고 있습니다.
              </div>
            )}
          </section>
        ) : null}

        {/* Facilitator info */}
        {facilitator && (
          <section className="text-sm text-slate-500 text-center">
            담당 퍼실리테이터: <strong>{facilitator.name}</strong>
          </section>
        )}
      </main>
    </div>
  );
}
