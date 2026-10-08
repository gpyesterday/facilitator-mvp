"use client";

import { useTransition } from "react";
import { setFacilitatorActiveAction } from "@/app/actions/facilitator";

interface Props {
  facilitatorId: string;
  isActive: boolean;
  name: string;
}

export function FacilitatorActiveToggle({
  facilitatorId,
  isActive,
  name,
}: Props) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !isActive;
    const label = next ? "활성" : "비활성";
    if (
      !confirm(
        `"${name}" 계정을 ${label} 상태로 변경할까요?\n\n` +
          (next
            ? "활성 시 플랫폼을 다시 사용할 수 있습니다."
            : "비활성 시 플랫폼을 사용할 수 없습니다. (삭제되지 않습니다)")
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await setFacilitatorActiveAction(facilitatorId, next);
      if (!result.success) {
        alert(result.error ?? "상태 변경에 실패했습니다.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      title={
        isActive
          ? "비활성으로 전환 (삭제 아님)"
          : "활성으로 전환"
      }
      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
        isActive
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
          : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
      }`}
    >
      {isPending ? "처리 중..." : isActive ? "활성" : "비활성"}
    </button>
  );
}
