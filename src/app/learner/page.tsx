import Link from "next/link";
import { initialData } from "@/data/mock";

export default function LearnerPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">미션 가이드</h1>
            <p className="text-sm text-slate-500">
              학습 단계와 관계없이 모든 공개 가이드를 확인할 수 있습니다.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-800"
          >
            홈으로
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-5">
        {initialData.stages.map((stage) => (
          <section
            key={stage.id}
            className="bg-white rounded-2xl border border-slate-200 p-6"
          >
            <div className="mb-4">
              <span className="text-xs font-semibold text-indigo-600">
                STAGE {stage.order}
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                {stage.title}
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                {stage.description}
              </p>
            </div>

            {stage.materials.length > 0 ? (
              <ul className="space-y-2">
                {stage.materials.map((material) => {
                  const isInternal = material.url.startsWith("/");

                  return (
                    <li key={material.url}>
                      <a
                        href={material.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition text-slate-800"
                      >
                        <span aria-hidden="true">
                          {isInternal ? "📘" : "📄"}
                        </span>
                        <span className="font-medium text-sm">
                          {material.title}
                        </span>
                        <span className="text-xs text-slate-400 ml-auto">
                          {isInternal ? "가이드 열기 →" : "외부 링크 →"}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">
                공개된 미션 가이드가 아직 없습니다.
              </p>
            )}
          </section>
        ))}
      </main>
    </div>
  );
}
