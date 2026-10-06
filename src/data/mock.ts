import { AppData } from "@/types";

export const initialData: AppData = {
  users: [
    {
      id: "admin-1",
      name: "운영 관리자",
      email: "admin@example.com",
      role: "admin",
      groupId: null,
    },
    {
      id: "fac-1",
      name: "김퍼실",
      email: "facilitator1@example.com",
      role: "facilitator",
      groupId: "group-1",
    },
    {
      id: "fac-2",
      name: "이퍼실",
      email: "facilitator2@example.com",
      role: "facilitator",
      groupId: "group-2",
    },
    {
      id: "learner-1",
      name: "박학습",
      email: "learner1@example.com",
      role: "learner",
      groupId: "group-1",
    },
    {
      id: "learner-2",
      name: "최학습",
      email: "learner2@example.com",
      role: "learner",
      groupId: "group-1",
    },
    {
      id: "learner-3",
      name: "정학습",
      email: "learner3@example.com",
      role: "learner",
      groupId: "group-1",
    },
    {
      id: "learner-4",
      name: "강학습",
      email: "learner4@example.com",
      role: "learner",
      groupId: "group-2",
    },
    {
      id: "learner-5",
      name: "윤학습",
      email: "learner5@example.com",
      role: "learner",
      groupId: "group-2",
    },
  ],
  groups: [
    {
      id: "group-1",
      name: "1기 A조",
      facilitatorId: "fac-1",
    },
    {
      id: "group-2",
      name: "1기 B조",
      facilitatorId: "fac-2",
    },
  ],
  stages: [
    {
      id: 1,
      order: 1,
      title: "1단계: 기초 다지기",
      description: "학습의 기본 개념을 이해하고, 필수 자료를 숙지하는 단계입니다.",
      materials: [
        {
          title: "오리엔테이션 가이드",
          url: "https://www.notion.so/example-orientation",
        },
        {
          title: "기초 개념 정리 문서",
          url: "https://www.notion.so/example-basics",
        },
      ],
      passCondition: "모든 자료를 읽고 핵심 내용을 이해한 후 '단계 완료'를 제출하세요. 담당 퍼실리테이터의 승인이 필요합니다.",
    },
    {
      id: 2,
      order: 2,
      title: "2단계: 심화 학습",
      description: "심화 자료를 통해 실무 역량을 기르는 단계입니다.",
      materials: [
        {
          title: "심화 학습 자료 모음",
          url: "https://www.notion.so/example-advanced",
        },
        {
          title: "실습 과제 가이드",
          url: "https://www.notion.so/example-practice",
        },
      ],
      passCondition: "심화 자료 학습 + 실습 과제 완료 후 제출. 퍼실리테이터 승인 필요.",
    },
    {
      id: 3,
      order: 3,
      title: "3단계: 프로젝트 & 마무리",
      description: "배운 내용을 종합하여 프로젝트를 수행하고 마무리하는 단계입니다.",
      materials: [
        {
          title: "최종 프로젝트 가이드",
          url: "https://www.notion.so/example-project",
        },
        {
          title: "회고 및 피드백 템플릿",
          url: "https://www.notion.so/example-retro",
        },
      ],
      passCondition: "프로젝트 결과물 제출 + 회고 작성 후 승인받으면 전체 과정 수료.",
    },
  ],
  progresses: [
    {
      learnerId: "learner-1",
      currentStage: 1,
      status: "in_progress",
      submittedAt: null,
      reviewedAt: null,
      reviewerId: null,
      note: null,
    },
    {
      learnerId: "learner-2",
      currentStage: 1,
      status: "submitted",
      submittedAt: "2026-10-05T10:00:00Z",
      reviewedAt: null,
      reviewerId: null,
      note: null,
    },
    {
      learnerId: "learner-3",
      currentStage: 2,
      status: "in_progress",
      submittedAt: null,
      reviewedAt: null,
      reviewerId: null,
      note: null,
    },
    {
      learnerId: "learner-4",
      currentStage: 2,
      status: "submitted",
      submittedAt: "2026-10-04T14:30:00Z",
      reviewedAt: null,
      reviewerId: null,
      note: null,
    },
    {
      learnerId: "learner-5",
      currentStage: 3,
      status: "in_progress",
      submittedAt: null,
      reviewedAt: null,
      reviewerId: null,
      note: null,
    },
  ],
};
