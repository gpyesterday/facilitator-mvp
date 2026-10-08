"use client";

import { useState, useTransition } from "react";
import { createFacilitatorAction } from "@/app/actions/facilitator";

export function RegisterFacilitatorForm() {
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createFacilitatorAction(formData);
      if (result.success) {
        setMessage({
          type: "success",
          text: `퍼실리테이터 "${result.user?.name}" 등록이 완료되었습니다.`,
        });
        form.reset();
      } else {
        setMessage({
          type: "error",
          text: result.error ?? "등록에 실패했습니다.",
        });
      }
    });
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-4">퍼실리테이터 등록</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              이름
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="홍길동"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              닉네임
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              required
              placeholder="길동이"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="facilitator@example.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              휴대전화
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder="010-1234-5678"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {message && (
          <div
            className={`text-sm rounded-lg px-3 py-2 ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isPending ? "등록 중..." : "퍼실리테이터 등록"}
        </button>
      </form>
    </div>
  );
}
