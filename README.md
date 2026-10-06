# 학습자 지원 퍼실리테이터 플랫폼 (MVP)

PoC를 위한 MVP 웹앱입니다.

## 주요 기능

- **3단계 학습 로드맵**: 학습자는 단계별로 진행하며, 각 단계에 통과 조건이 있습니다.
- **학습자**: 현재 단계의 학습 자료(Notion 링크 등) 열람 + 단계 완료 제출
- **퍼실리테이터**: 담당 그룹 학습자들의 현재 단계를 한눈에 확인 + 승인/반려
- **관리자**: 그룹 및 전체 현황 조회

## 기술 스택

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- **Neon (Postgres)** — Vercel 연동

## 배포

## 배포 정보
Vercel (팀 설정 없음. 개인 free)
- https://facilitator-mvp.vercel.app/

## DB (Neon)

Vercel 프로젝트에 Neon 스토어가 연결되어 있으면 `DATABASE_URL` 환경변수가 자동 주입됩니다.

앱 최초 요청 시:
1. 필요한 테이블(`users`, `groups`, `stages`, `progresses`)을 생성
2. 테이블이 비어 있으면 `src/data/mock.ts` 초기 데이터를 시드

로컬 개발 시 `.env.local`에 Neon connection string을 넣으세요:

```bash
# .env.local
DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

## 실행 방법

```bash
cd facilitator-mvp
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 테스트 계정

홈 화면에서 역할별 테스트 계정을 선택하면 됩니다.

- **퍼실리테이터**: 김퍼실 (1기 A조), 이퍼실 (1기 B조)
- **학습자**: 박학습, 최학습 등
- **관리자**: 운영 관리자

## 데이터

- 초기 시드 데이터: `src/data/mock.ts`
- 런타임 데이터: Neon Postgres (제출/승인 시 DB 업데이트)

## 주요 흐름

1. 학습자가 자료를 읽고 "이 단계를 완료했습니다" 클릭
2. 퍼실리테이터 대시보드에 "승인 대기"로 표시
3. 퍼실리테이터가 승인 → 다음 단계로 이동 / 반려 → 다시 학습 중 상태
