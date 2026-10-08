import Link from "next/link";
import { getData } from "@/lib/store";

export default async function HomePage() {
  const data = await getData();

  const facilitators = data.users.filter((u) => u.role === "facilitator");
  const learners = data.users.filter((u) => u.role === "learner");
  const admins = data.users.filter((u) => u.role === "admin");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <h1 className="text-xl font-bold text-slate-900">
            학습자 지원 퍼실리테이터 플랫폼
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            MVP · PoC 버전 (역할 선택으로 로그인)
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            테스트 계정으로 접속하기
          </h2>
          <p className="text-sm text-slate-600">
            실제 인증 없이 역할을 선택하여 각 화면을 확인할 수 있습니다.
          </p>
        </div>

        {/* Admin */}
        <section className="mb-10">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
            관리자
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {admins.map((user) => (
              <Link
                key={user.id}
                href={`/admin?userId=${user.id}`}
                className="block p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition"
              >
                <div className="font-medium text-slate-900">{user.name}</div>
                <div className="text-sm text-slate-500">{user.email}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Facilitators */}
        <section className="mb-10">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
            퍼실리테이터
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {facilitators.map((user) =>
              user.isActive ? (
                <Link
                  key={user.id}
                  href={`/facilitator?userId=${user.id}`}
                  className="block p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition"
                >
                  <div className="font-medium text-slate-900">{user.name}</div>
                  <div className="text-sm text-slate-500">{user.email}</div>
                </Link>
              ) : (
                <div
                  key={user.id}
                  className="block p-4 bg-slate-100 border border-slate-200 rounded-xl opacity-70 cursor-not-allowed"
                  title="비활성 계정 — 플랫폼 사용 불가"
                >
                  <div className="font-medium text-slate-600">{user.name}</div>
                  <div className="text-sm text-slate-400">{user.email}</div>
                  <div className="text-xs text-slate-500 mt-1">비활성</div>
                </div>
              )
            )}
          </div>
        </section>

        {/* Learners */}
        <section>
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
            학습자
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {learners.map((user) => (
              <Link
                key={user.id}
                href={`/learner?userId=${user.id}`}
                className="block p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition"
              >
                <div className="font-medium text-slate-900">{user.name}</div>
                <div className="text-sm text-slate-500">{user.email}</div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
