import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getData,
  getFacilitatorGroup,
  getLearnersByGroup,
  getStages,
  getUserById,
} from "@/lib/store";
import { ReviewButtons } from "@/components/ReviewButtons";

interface Props {
  searchParams: { userId?: string };
}

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
    3: "bg-indigo-50 text-indigo-700 border-indigo-200",
    4: "bg-emerald-50 text-emerald-700 border-emerald-200",
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
        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-2xl font-bold text-slate-900">
              {learners.length}
            </div>
            <div className="text-sm text-slate-500">담당 학습자</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-2xl font-bold text-amber-600">
              {
                learnersWithProgress.filter(
                  (l) => l.progress?.status === "submitted"
                ).length
              }
            </div>
            <div className="text-sm text-slate-500">승인 대기</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-2xl font-bold text-blue-600">
              {
                learnersWithProgress.filter(
                  (l) => l.progress?.currentStage === 2
                ).length
              }
            </div>
            <div className="text-sm text-slate-500">2단계 진행</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-2xl font-bold text-emerald-600">
              {
                learnersWithProgress.filter(
                  (l) => l.progress?.currentStage === 4
                ).length
              }
            </div>
            <div className="text-sm text-slate-500">수료 완료</div>
          </div>
        </div>

        {/* Learner Cards */}
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
          학습자 현황
        </h2>

        <div className="space-y-4">
          {learnersWithProgress.map(({ learner, progress }) => {
            if (!progress) return null;

            const stage =
              progress.currentStage <= 3
                ? stages.find((s) => s.order === progress.currentStage)
                : null;

            const badge = statusBadge[progress.status];

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
                          stageColors[4]
                        }`}
                      >
                        {progress.currentStage === 4
                          ? "수료 완료"
                          : `Stage ${progress.currentStage}`}
                      </span>
                      {stage && (
                        <span className="text-slate-600">{stage.title}</span>
                      )}
                    </div>

                    {progress.submittedAt && (
                      <p className="text-xs text-slate-400 mt-2">
                        제출 시각:{" "}
                        {new Date(progress.submittedAt).toLocaleString("ko-KR")}
                      </p>
                    )}
                  </div>

                  {progress.status === "submitted" && (
                    <ReviewButtons
                      learnerId={learner.id}
                      reviewerId={userId}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
