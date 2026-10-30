"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { User } from "@/types";

const ADMIN_ACCESS_PASSWORD = "1234헤헤";

interface HomePageContentProps {
  facilitators: User[];
  admins: User[];
}

export default function HomePageContent({
  facilitators,
  admins,
}: HomePageContentProps) {
  const [isAccountListVisible, setIsAccountListVisible] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== ADMIN_ACCESS_PASSWORD) {
      setPasswordError("암호가 올바르지 않습니다.");
      return;
    }

    setIsAccountListVisible(true);
    setIsPasswordDialogOpen(false);
    setPassword("");
    setPasswordError("");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              학습자 지원 퍼실리테이터 플랫폼
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              MVP · 퍼실리테이터/관리자 테스트 계정 및 공개 미션 가이드
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setPassword("");
              setPasswordError("");
              setIsPasswordDialogOpen(true);
            }}
            className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition"
          >
            관리
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {isAccountListVisible && (
          <>
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">
                테스트 계정으로 접속하기
              </h2>
              <p className="text-sm text-slate-600">
                실제 인증 없이 역할을 선택하여 각 화면을 확인할 수 있습니다.
              </p>
            </div>

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
                      <div className="font-medium text-slate-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                    </Link>
                  ) : (
                    <div
                      key={user.id}
                      className="block p-4 bg-slate-100 border border-slate-200 rounded-xl opacity-70 cursor-not-allowed"
                      title="비활성 계정 — 플랫폼 사용 불가"
                    >
                      <div className="font-medium text-slate-600">
                        {user.name}
                      </div>
                      <div className="text-sm text-slate-400">{user.email}</div>
                      <div className="text-xs text-slate-500 mt-1">비활성</div>
                    </div>
                  )
                )}
              </div>
            </section>
          </>
        )}

        <section>
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
            미션 가이드
          </h3>
          <Link
            href="/learner"
            className="block p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition"
          >
            <div className="font-medium text-slate-900">
              모든 단계의 미션 가이드 보기
            </div>
            <div className="text-sm text-slate-500">
              학습자 정보 없이 공개된 단계별 안내를 확인할 수 있습니다.
            </div>
          </Link>
        </section>

        <section className="mt-10">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
            실습 가이드
          </h3>
          <a
            href="/guides/file-extensions.html"
            className="block p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition"
          >
            <div className="font-medium text-slate-900">파일 확장자</div>
            <div className="text-sm text-slate-500">
              Markdown, HTML, ZIP, 이미지 파일의 특징과 사용 방법을 확인합니다.
            </div>
          </a>
        </section>
      </main>

      {isPasswordDialogOpen && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/50 px-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsPasswordDialogOpen(false);
            }
          }}
        >
          <form
            onSubmit={handlePasswordSubmit}
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-password-title"
          >
            <h2
              id="admin-password-title"
              className="text-lg font-semibold text-slate-900"
            >
              관리 암호 입력
            </h2>
            <label
              htmlFor="admin-password"
              className="mt-4 block text-sm font-medium text-slate-700"
            >
              암호
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setPasswordError("");
              }}
              autoFocus
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
            {passwordError && (
              <p role="alert" className="mt-2 text-sm text-red-600">
                {passwordError}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPasswordDialogOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                취소
              </button>
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                확인
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
