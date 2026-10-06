"use client";

import { useState, useTransition } from "react";
import { reviewStageAction } from "@/app/actions/progress";

export function ReviewButtons({
  learnerId,
  reviewerId,
}: {
  learnerId: string;
  reviewerId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState("");

  const handleReview = (decision: "passed" | "rejected") => {
    startTransition(async () => {
      await reviewStageAction(learnerId, reviewerId, decision, note || undefined);
      setNote("");
    });
  };

  return (
    <div className="flex flex-col gap-2 min-w-[200px]">
      <input
        type="text"
        placeholder="피드백 (선택)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
      <div className="flex gap-2">
        <button
          onClick={() => handleReview("passed")}
          disabled={isPending}
          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-medium rounded-lg transition"
        >
          {isPending ? "..." : "승인"}
        </button>
        <button
          onClick={() => handleReview("rejected")}
          disabled={isPending}
          className="flex-1 py-2 px-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-medium rounded-lg transition"
        >
          {isPending ? "..." : "반려"}
        </button>
      </div>
    </div>
  );
}
