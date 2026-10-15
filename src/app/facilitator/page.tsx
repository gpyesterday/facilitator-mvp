import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getData,
  getFacilitatorGroup,
  getLearnersByGroup,
  getStages,
  getUserById,
  syncStagesFromMock,
} from "@/lib/store";
import { LearnerStageSelector } from "@/components/LearnerStageSelector";

interface Props {
  searchParams: { userId?: string };
}

const STAGE_SHORT: Record<number, string> = {
  1: "AI 도구",
  2: "AI 활용",
  3: "AI 응용",
  4: "파이널 프로젝트",
};

export default async function FacilitatorPage({ searchParams }: Props) {
  const { userId } = searchParams;
  if (!userId) notFound();

  const user = await getUserById(userId);
  if (!user || user.role !== "facilitator") notFound();

  // 비활성 계정은 플랫폼 사용 불가 (삭제 아님)
  if (!user.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-md text-center shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900 mb-2">
            계정이 비활성 상태입니다
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            관리자에 의해 비활성 처리된 계정입니다. 플랫폼을 사용할 수 없습니다.
            <br />
            (계정이 삭제된 것은 아닙니다.)
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const group = await getFacilitatorGroup(userId);
  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>담당 그룹이 배정되지 않았습니다.</p>
      </div>
    );
  }

  await syncStagesFromMock();
  const learners = await getLearnersByGroup(group.id);
  const stages = await getStages();
  const data = await getData();

  const learnersWithProgress = learners.map((learner) => {
    const progress = data.progresses.find((p) => p.learnerId === learner.id);
    return { learner, progress };
  });

  // Sort: submitted first, then by stage
  learnersWithProgress.sort((a, b) => {
    if (a.progress?.status === "submitted" && b.progress?.status !== "submitted")
      return -1;
    if (b.progress?.status === "submitted" && a.progress?.status !== "submitted")
      return 1;
    return (a.progress?.currentStage ?? 0) - (b.progress?.currentStage ?? 0);
  });

  const stageColors: Record<number, string> = {
    1: "bg-slate-100 text-slate-700 border-slate-200",
    2: "bg-blue-50 text-blue-700 border-blue-200",
    3: "bg-violet-50 text-violet-700 border-violet-200",
    4: "bg-amber-50 text-amber-800 border-amber-200",
    5: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  const statusBadge: Record<string, { label: string; className: string }> = {
    in_progress: {
      label: "학습 중",
      className: "bg-slate-100 text-slate-600",
    },
    submitted: {
      label: "승인 대기",
      className: "bg-amber-100 text-amber-800 ring-2 ring-amber-300",
    },
    passed: {
      label: "통과",
      className: "bg-emerald-100 text-emerald-700",
    },
    rejected: {
      label: "반려",
      className: "bg-red-100 text-red-700",
    },
  };

  // 단계별 진입 인원 (현재 해당 단계에 있는 학습자 수; 수료는 5)
  const stageEntryCounts = [1, 2, 3, 4].map((order) => ({
    order,
    label: STAGE_SHORT[order] ?? `${order}단계`,
    learners: learnersWithProgress.filter(
      (l) => l.progress?.currentStage === order
    ),
  }));
  const completedCount = learnersWithProgress.filter(
    (l) => (l.progress?.currentStage ?? 0) >= 5
  ).length;
  const pendingCount = learnersWithProgress.filter(
    (l) => l.progress?.status === "submitted"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              퍼실리테이터 대시보드
            </h1>
            <p className="text-sm text-slate-500">
              {user.name} · {group.name}
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

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Summary: 총원 / 승인대기 / 수료 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-2xl font-bold text-slate-900">
              {learners.length}
            </div>
            <div className="text-sm text-slate-500">담당 학습자</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-2xl font-bold text-amber-600">
              {pendingCount}
            </div>
            <div className="text-sm text-slate-500">승인 대기</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-2xl font-bold text-emerald-600">
              {completedCount}
            </div>
            <div className="text-sm text-slate-500">수료 완료</div>
          </div>
        </div>

        {/* 단계별 진입 현황 */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
            단계별 진입 현황
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stageEntryCounts.map(({ order, label, learners: stageLearners }) => (
              <div
                key={order}
                className="bg-white rounded-xl border border-slate-200 p-4"
              >
                <div className="text-xs font-medium text-slate-500 mb-1">
                  {order}단계
                </div>
                <div className="text-lg font-semibold text-slate-900 truncate">
                  {label}
                </div>
                <div className="mt-2 text-2xl font-bold text-indigo-600">
                  {stageLearners.length}
                  <span className="text-sm font-normal text-slate-400 ml-1">
                    명
                  </span>
                </div>
                <div className="mt-2 text-sm text-slate-600 break-words">
                  {stageLearners.length > 0
                    ? stageLearners.map(({ learner }) => learner.name).join(", ")
                    : "해당 없음"}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            파이널 프로젝트(4단계)만 팀으로 진행합니다. 위 숫자는 현재 해당 단계에
            진입해 있는 학습자 수입니다.
          </p>
        </section>

        {/* Learner Cards */}
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
          학습자 현황
        </h2>

        <div className="space-y-4">
          {learnersWithProgress.map(({ learner, progress }) => {
            if (!progress) return null;

            const stage =
              progress.currentStage <= 4
                ? stages.find((s) => s.order === progress.currentStage)
                : null;

            const badge = statusBadge[progress.status];
            const isCompleted = progress.currentStage >= 5;
            const stageLabel = isCompleted
              ? "수료 완료"
              : STAGE_SHORT[progress.currentStage] ??
                `Stage ${progress.currentStage}`;

            return (
              <div
                key={learner.id}
                className={`bg-white rounded-2xl border p-5 transition ${
                  progress.status === "submitted"
                    ? "border-amber-300 shadow-sm"
                    : "border-slate-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">
                        {learner.name}
                      </h3>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-lg border text-xs font-medium ${
                          stageColors[progress.currentStage] ??
                          stageColors[5]
                        }`}
                      >
                        {isCompleted
                          ? "수료 완료"
                          : `${progress.currentStage}단계 · ${stageLabel}`}
                      </span>
                      {stage && !isCompleted && (
                        <span className="text-slate-600 text-xs sm:text-sm">
                          {stage.title}
                        </span>
                      )}
                      {progress.currentStage === 4 && (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          팀 프로젝트
                        </span>
                      )}
                    </div>

                    {progress.submittedAt && (
                      <p className="text-xs text-slate-400 mt-2">
                        제출 시각:{" "}
                        {new Date(progress.submittedAt).toLocaleString("ko-KR")}
                      </p>
                    )}
                  </div>

                  <LearnerStageSelector
                    learnerId={learner.id}
                    currentStage={progress.currentStage}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
