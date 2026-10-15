"use server";

import { revalidatePath } from "next/cache";
import { reviewStage, setLearnerStage } from "@/lib/store";

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

export async function setLearnerStageAction(
  learnerId: string,
  stageOrder: number
) {
  const success = await setLearnerStage(learnerId, stageOrder);
  if (success) {
    revalidatePath("/learner");
    revalidatePath("/facilitator");
  }
  return { success };
}
