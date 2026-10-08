import { neon, NeonQueryFunction } from "@neondatabase/serverless";

let sql: NeonQueryFunction<false, false> | null = null;

export function getSql() {
  if (sql) return sql;

  // Vercel Neon 연동 시 기본: DATABASE_URL / POSTGRES_URL
  // 일부 프로젝트에서 접두어(facil_)가 붙는 경우도 지원
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.facil_POSTGRES_URL ||
    process.env.facil_DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.facil_POSTGRES_URL_NON_POOLING;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL (or POSTGRES_URL / facil_POSTGRES_URL) is not set. Neon 연결을 Vercel 환경변수에 설정했는지 확인하세요."
    );
  }

  sql = neon(connectionString);
  return sql;
}
