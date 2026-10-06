export type Role = "learner" | "facilitator" | "admin";

export type ProgressStatus = "in_progress" | "submitted" | "passed" | "rejected";

export interface Material {
  title: string;
  url: string;
}

export interface Stage {
  id: number;
  order: number;
  title: string;
  description: string;
  materials: Material[];
  passCondition: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  groupId: string | null;
}

export interface Group {
  id: string;
  name: string;
  facilitatorId: string;
}

export interface Progress {
  learnerId: string;
  currentStage: number; // 1, 2, 3 (or 4 if completed all)
  status: ProgressStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewerId: string | null;
  note: string | null;
}

export interface AppData {
  users: User[];
  groups: Group[];
  stages: Stage[];
  progresses: Progress[];
}
