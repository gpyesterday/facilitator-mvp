"use client";

import { useTransition } from "react";
import { submitStageAction } from "@/app/actions/progress";

export function SubmitButton({ learnerId }: { learnerId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      await submitStageAction(learnerId);
    });
  };

  return (
    <button
      onClick={handleSubmit}
      disabled={isPending}
      className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl transition"
    >
      {isPending ? "제출 중..." : "이 단계를 완료했습니다"}
    </button>
  );
}
