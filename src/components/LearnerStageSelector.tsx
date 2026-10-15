"use client";

import { useTransition } from "react";
import { setLearnerStageAction } from "@/app/actions/progress";

const STAGE_OPTIONS = [
  { order: 1, label: "도구" },
  { order: 2, label: "활용" },
  { order: 3, label: "응용" },
  { order: 4, label: "파이널" },
];

export function LearnerStageSelector({
  learnerId,
  currentStage,
}: {
  learnerId: string;
  currentStage: number;
}) {
  const [isPending, startTransition] = useTransition();

  const selectStage = (stageOrder: number) => {
    if (stageOrder === currentStage) return;

    startTransition(async () => {
      await setLearnerStageAction(learnerId, stageOrder);
    });
  };

  return (
    <div className="min-w-[224px] space-y-2">
      <div className="text-xs font-medium text-slate-500">진입 단계</div>
      <div
        role="group"
        aria-label="학습자 진입 단계 변경"
        className="grid grid-cols-4 gap-1"
      >
        {STAGE_OPTIONS.map(({ order, label }) => {
          const isSelected = currentStage === order;

          return (
            <button
              key={order}
              type="button"
              aria-pressed={isSelected}
              title={`${label} 단계로 변경`}
              disabled={isPending || isSelected}
              onClick={() => selectStage(order)}
              className={`rounded-lg border px-2 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isSelected
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}