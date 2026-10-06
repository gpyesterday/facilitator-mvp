import { neon, NeonQueryFunction } from "@neondatabase/serverless";

let sql: NeonQueryFunction<false, false> | null = null;

export function getSql() {
  if (sql) return sql;

  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL (or POSTGRES_URL) is not set. Neon 연결을 Vercel 환경변수에 설정했는지 확인하세요."
    );
  }

  sql = neon(connectionString);
  return sql;
}
