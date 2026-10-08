import { AppData, Group, Progress, ProgressStatus, Stage, User } from "@/types";
import { initialData } from "@/data/mock";
import { getSql } from "./db";

/** 테이블 생성 + 시드 (최초 1회) */
async function ensureSchemaAndSeed() {
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      nickname TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL CHECK (role IN ('learner', 'facilitator', 'admin')),
      group_id TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true
    )
  `;

  // 기존 테이블에 컬럼 추가 (이미 배포된 DB 대응)
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true`;

  await sql`
    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      facilitator_id TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS stages (
      id INTEGER PRIMARY KEY,
      stage_order INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      materials JSONB NOT NULL DEFAULT '[]',
      pass_condition TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS progresses (
      learner_id TEXT PRIMARY KEY,
      current_stage INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'in_progress'
        CHECK (status IN ('in_progress', 'submitted', 'passed', 'rejected')),
      submitted_at TIMESTAMPTZ,
      reviewed_at TIMESTAMPTZ,
      reviewer_id TEXT,
      note TEXT
    )
  `;

  // 시드: users가 비어 있으면 초기 데이터 삽입
  const countResult = await sql`SELECT COUNT(*)::int AS cnt FROM users`;
  const count = (countResult[0] as { cnt: number }).cnt;

  if (count === 0) {
    for (const u of initialData.users) {
      await sql`
        INSERT INTO users (id, name, nickname, email, phone, role, group_id, is_active)
        VALUES (${u.id}, ${u.name}, ${u.nickname}, ${u.email}, ${u.phone}, ${u.role}, ${u.groupId}, ${u.isActive})
      `;
    }
    for (const g of initialData.groups) {
      await sql`
        INSERT INTO groups (id, name, facilitator_id)
        VALUES (${g.id}, ${g.name}, ${g.facilitatorId})
      `;
    }
    for (const s of initialData.stages) {
      const materialsJson = JSON.stringify(s.materials);
      await sql`
        INSERT INTO stages (id, stage_order, title, description, materials, pass_condition)
        VALUES (
          ${s.id},
          ${s.order},
          ${s.title},
          ${s.description},
          ${materialsJson}::jsonb,
          ${s.passCondition}
        )
      `;
    }
    for (const p of initialData.progresses) {
      await sql`
        INSERT INTO progresses (
          learner_id, current_stage, status,
          submitted_at, reviewed_at, reviewer_id, note
        )
        VALUES (
          ${p.learnerId},
          ${p.currentStage},
          ${p.status},
          ${p.submittedAt},
          ${p.reviewedAt},
          ${p.reviewerId},
          ${p.note}
        )
      `;
    }
  }

  // stages는 mock.ts 기준으로 항상 동기화 (가이드/로드맵 업데이트 반영)
  for (const s of initialData.stages) {
    const materialsJson = JSON.stringify(s.materials);
    await sql`
      INSERT INTO stages (id, stage_order, title, description, materials, pass_condition)
      VALUES (
        ${s.id},
        ${s.order},
        ${s.title},
        ${s.description},
        ${materialsJson}::jsonb,
        ${s.passCondition}
      )
      ON CONFLICT (id) DO UPDATE SET
        stage_order = EXCLUDED.stage_order,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        materials = EXCLUDED.materials,
        pass_condition = EXCLUDED.pass_condition
    `;
  }
}

let schemaReady: Promise<void> | null = null;

function ensureReady() {
  if (!schemaReady) {
    schemaReady = ensureSchemaAndSeed().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

/** stages를 mock.ts 기준으로 강제 재동기화 (배포 후 가이드 링크 반영용) */
export async function syncStagesFromMock() {
  await ensureReady();
  const sql = getSql();
  for (const s of initialData.stages) {
    const materialsJson = JSON.stringify(s.materials);
    await sql`
      INSERT INTO stages (id, stage_order, title, description, materials, pass_condition)
      VALUES (
        ${s.id},
        ${s.order},
        ${s.title},
        ${s.description},
        ${materialsJson}::jsonb,
        ${s.passCondition}
      )
      ON CONFLICT (id) DO UPDATE SET
        stage_order = EXCLUDED.stage_order,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        materials = EXCLUDED.materials,
        pass_condition = EXCLUDED.pass_condition
    `;
  }
}

// ─── Row → Domain mappers ───────────────────────────────────────────

function mapUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    name: row.name as string,
    nickname: (row.nickname as string) ?? null,
    email: row.email as string,
    phone: (row.phone as string) ?? null,
    role: row.role as User["role"],
    groupId: (row.group_id as string) ?? null,
    isActive: row.is_active === false || row.is_active === "f" ? false : true,
  };
}

function mapGroup(row: Record<string, unknown>): Group {
  return {
    id: row.id as string,
    name: row.name as string,
    facilitatorId: row.facilitator_id as string,
  };
}

function mapStage(row: Record<string, unknown>): Stage {
  return {
    id: row.id as number,
    order: row.stage_order as number,
    title: row.title as string,
    description: row.description as string,
    materials: (typeof row.materials === "string"
      ? JSON.parse(row.materials)
      : row.materials) as Stage["materials"],
    passCondition: row.pass_condition as string,
  };
}

function mapProgress(row: Record<string, unknown>): Progress {
  return {
    learnerId: row.learner_id as string,
    currentStage: row.current_stage as number,
    status: row.status as ProgressStatus,
    submittedAt: row.submitted_at
      ? new Date(row.submitted_at as string).toISOString()
      : null,
    reviewedAt: row.reviewed_at
      ? new Date(row.reviewed_at as string).toISOString()
      : null,
    reviewerId: (row.reviewer_id as string) ?? null,
    note: (row.note as string) ?? null,
  };
}

// ─── Public API (기존 시그니처 유지) ─────────────────────────────────

export async function getData(): Promise<AppData> {
  await ensureReady();
  const sql = getSql();

  const [users, groups, stages, progresses] = await Promise.all([
    sql`SELECT * FROM users ORDER BY id`,
    sql`SELECT * FROM groups ORDER BY id`,
    sql`SELECT * FROM stages ORDER BY stage_order`,
    sql`SELECT * FROM progresses ORDER BY learner_id`,
  ]);

  return {
    users: users.map(mapUser),
    groups: groups.map(mapGroup),
    stages: stages.map(mapStage),
    progresses: progresses.map(mapProgress),
  };
}

export async function getUserById(id: string) {
  await ensureReady();
  const sql = getSql();
  const rows = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
  return rows[0] ? mapUser(rows[0]) : null;
}

export async function getLearnersByGroup(groupId: string) {
  await ensureReady();
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM users
    WHERE role = 'learner' AND group_id = ${groupId}
    ORDER BY name
  `;
  return rows.map(mapUser);
}

export async function getProgress(learnerId: string) {
  await ensureReady();
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM progresses WHERE learner_id = ${learnerId} LIMIT 1
  `;
  return rows[0] ? mapProgress(rows[0]) : null;
}

export async function submitStage(learnerId: string): Promise<boolean> {
  await ensureReady();
  const sql = getSql();

  const rows = await sql`
    SELECT * FROM progresses
    WHERE learner_id = ${learnerId} AND status = 'in_progress'
    LIMIT 1
  `;
  if (!rows[0]) return false;

  await sql`
    UPDATE progresses
    SET
      status = 'submitted',
      submitted_at = NOW(),
      note = NULL
    WHERE learner_id = ${learnerId}
  `;
  return true;
}

export async function reviewStage(
  learnerId: string,
  reviewerId: string,
  decision: "passed" | "rejected",
  note?: string
): Promise<boolean> {
  await ensureReady();
  const sql = getSql();

  const rows = await sql`
    SELECT * FROM progresses
    WHERE learner_id = ${learnerId} AND status = 'submitted'
    LIMIT 1
  `;
  if (!rows[0]) return false;

  const progress = mapProgress(rows[0]);

  if (decision === "passed") {
    if (progress.currentStage < 3) {
      await sql`
        UPDATE progresses
        SET
          current_stage = ${progress.currentStage + 1},
          status = 'in_progress',
          submitted_at = NULL,
          reviewed_at = NULL,
          reviewer_id = NULL,
          note = NULL
        WHERE learner_id = ${learnerId}
      `;
    } else {
      await sql`
        UPDATE progresses
        SET
          current_stage = 4,
          status = 'passed',
          reviewed_at = NOW(),
          reviewer_id = ${reviewerId},
          note = ${note ?? null}
        WHERE learner_id = ${learnerId}
      `;
    }
  } else {
    await sql`
      UPDATE progresses
      SET
        status = 'in_progress',
        submitted_at = NULL,
        reviewed_at = NOW(),
        reviewer_id = ${reviewerId},
        note = ${note ?? null}
      WHERE learner_id = ${learnerId}
    `;
  }

  return true;
}

export async function getStages() {
  await ensureReady();
  const sql = getSql();
  const rows = await sql`SELECT * FROM stages ORDER BY stage_order`;
  return rows.map(mapStage);
}

export async function getGroupById(groupId: string) {
  await ensureReady();
  const sql = getSql();
  const rows = await sql`SELECT * FROM groups WHERE id = ${groupId} LIMIT 1`;
  return rows[0] ? mapGroup(rows[0]) : null;
}

export async function getFacilitatorGroup(facilitatorId: string) {
  await ensureReady();
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM groups WHERE facilitator_id = ${facilitatorId} LIMIT 1
  `;
  return rows[0] ? mapGroup(rows[0]) : null;
}

/** 퍼실리테이터 등록 (관리자용) */
export async function createFacilitator(input: {
  name: string;
  nickname: string;
  email: string;
  phone: string;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  await ensureReady();
  const sql = getSql();

  const name = input.name.trim();
  const nickname = input.nickname.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();

  if (!name || !nickname || !email || !phone) {
    return { success: false, error: "모든 항목을 입력해 주세요." };
  }

  // 이메일 중복 체크
  const existing = await sql`
    SELECT id FROM users WHERE email = ${email} LIMIT 1
  `;
  if (existing.length > 0) {
    return { success: false, error: "이미 등록된 이메일입니다." };
  }

  const id = `fac-${Date.now()}`;

  await sql`
    INSERT INTO users (id, name, nickname, email, phone, role, group_id, is_active)
    VALUES (${id}, ${name}, ${nickname}, ${email}, ${phone}, 'facilitator', NULL, true)
  `;

  const user: User = {
    id,
    name,
    nickname,
    email,
    phone,
    role: "facilitator",
    groupId: null,
    isActive: true,
  };

  return { success: true, user };
}

/** 퍼실리테이터 활성/비활성 토글 (삭제 아님 — 비활성 시 플랫폼 사용 불가) */
export async function setFacilitatorActive(
  facilitatorId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  await ensureReady();
  const sql = getSql();

  const rows = await sql`
    SELECT id, role FROM users WHERE id = ${facilitatorId} LIMIT 1
  `;
  if (!rows[0]) {
    return { success: false, error: "사용자를 찾을 수 없습니다." };
  }
  if ((rows[0] as { role: string }).role !== "facilitator") {
    return { success: false, error: "퍼실리테이터만 활성/비활성할 수 있습니다." };
  }

  await sql`
    UPDATE users SET is_active = ${isActive} WHERE id = ${facilitatorId}
  `;

  return { success: true };
}
