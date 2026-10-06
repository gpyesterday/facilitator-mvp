"use server";

import { revalidatePath } from "next/cache";
import { reviewStage, submitStage } from "@/lib/store";

export async function submitStageAction(learnerId: string) {
  const success = await submitStage(learnerId);
  if (success) {
    revalidatePath("/learner");
    revalidatePath("/facilitator");
  }
  return { success };
}

export async function reviewStageAction(
  learnerId: string,
  reviewerId: string,
  decision: "passed" | "rejected",
  note?: string
) {
  const success = await reviewStage(learnerId, reviewerId, decision, note);
  if (success) {
    revalidatePath("/learner");
    revalidatePath("/facilitator");
  }
  return { success };
}
