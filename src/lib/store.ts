import { AppData } from "@/types";
import { initialData } from "@/data/mock";

// In-memory store for Vercel / serverless compatibility
// Data resets on cold start / redeploy (acceptable for PoC)
let data: AppData = structuredClone(initialData);

export async function getData(): Promise<AppData> {
  return data;
}

export async function saveData(newData: AppData): Promise<void> {
  data = newData;
}

export async function getUserById(id: string) {
  return data.users.find((u) => u.id === id) ?? null;
}

export async function getLearnersByGroup(groupId: string) {
  return data.users.filter((u) => u.role === "learner" && u.groupId === groupId);
}

export async function getProgress(learnerId: string) {
  return data.progresses.find((p) => p.learnerId === learnerId) ?? null;
}

export async function submitStage(learnerId: string): Promise<boolean> {
  const progress = data.progresses.find((p) => p.learnerId === learnerId);
  if (!progress || progress.status !== "in_progress") return false;

  progress.status = "submitted";
  progress.submittedAt = new Date().toISOString();
  progress.note = null;
  return true;
}

export async function reviewStage(
  learnerId: string,
  reviewerId: string,
  decision: "passed" | "rejected",
  note?: string
): Promise<boolean> {
  const progress = data.progresses.find((p) => p.learnerId === learnerId);
  if (!progress || progress.status !== "submitted") return false;

  progress.status = decision;
  progress.reviewedAt = new Date().toISOString();
  progress.reviewerId = reviewerId;
  progress.note = note ?? null;

  if (decision === "passed") {
    if (progress.currentStage < 3) {
      progress.currentStage += 1;
      progress.status = "in_progress";
      progress.submittedAt = null;
      progress.reviewedAt = null;
      progress.reviewerId = null;
      progress.note = null;
    } else {
      progress.currentStage = 4;
      progress.status = "passed";
    }
  } else {
    progress.status = "in_progress";
    progress.submittedAt = null;
  }

  return true;
}

export async function getStages() {
  return data.stages;
}

export async function getGroupById(groupId: string) {
  return data.groups.find((g) => g.id === groupId) ?? null;
}

export async function getFacilitatorGroup(facilitatorId: string) {
  return data.groups.find((g) => g.facilitatorId === facilitatorId) ?? null;
}
