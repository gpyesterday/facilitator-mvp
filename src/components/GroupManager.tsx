"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

import { Group } from "@/types";
import { createGroupAction, importLearnersAction } from "@/app/actions/group";

interface Props {
  facilitatorId: string;
  groups: Group[];
  initialGroupId?: string;
}

function normalizeKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, "");
}

function findValueByAliases(
  row: Record<string, unknown>,
  aliases: string[]
): string {
  const map = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [normalizeKey(key), value])
  );

  for (const alias of aliases) {
    const key = normalizeKey(alias);
    const value = map[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }

  return "";
}

function parseWorkbookRows(file: File) {
  return new Promise<Array<Record<string, unknown>>>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        if (!(data instanceof ArrayBuffer)) {
          reject(new Error("파일을 읽을 수 없습니다."));
          return;
        }

        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          defval: "",
        });
        resolve(rows);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("파일을 읽는 중 오류가 발생했습니다."));
    reader.readAsArrayBuffer(file);
  });
}

type ImportRow = {
  name: string;
  email: string;
  phone?: string;
  nickname?: string;
};

function normalizeLearnerRow(row: Record<string, unknown>): ImportRow | null {
  const name = findValueByAliases(row, [
    "name",
    "fullname",
    "learnername",
    "studentname",
    "이름",
    "학습자명",
    "학생명",
  ]);
  const nickname = findValueByAliases(row, [
    "nickname",
    "nick",
    "별명",
    "닉네임",
  ]);
  const email = findValueByAliases(row, [
    "email",
    "mail",
    "e_mail",
    "이메일",
    "메일주소",
  ]);
  const phone = findValueByAliases(row, [
    "phone",
    "phonenumber",
    "mobile",
    "tel",
    "telephone",
    "휴대폰",
    "휴대전화",
    "전화번호",
    "핸드폰",
  ]);

  if (!name || !email) {
    return null;
  }

  return {
    name,
    nickname: nickname || undefined,
    email,
    phone: phone || undefined,
  };
}

export function GroupManager({ facilitatorId, groups, initialGroupId }: Props) {
  const router = useRouter();
  const [localGroups, setLocalGroups] = useState(groups);
  const [selectedGroupId, setSelectedGroupId] = useState(
    initialGroupId ?? groups[0]?.id ?? ""
  );

  useEffect(() => {
    setLocalGroups(groups);
    if (initialGroupId) {
      setSelectedGroupId(initialGroupId);
    } else if (groups[0]) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, initialGroupId]);
  const [groupName, setGroupName] = useState("");
  const [groupMessage, setGroupMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importMessage, setImportMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isCreating, startCreate] = useTransition();
  const [isImporting, startImport] = useTransition();

  const selectedGroup =
    localGroups.find((group) => group.id === selectedGroupId) ?? localGroups[0] ?? null;

  async function handleCreateGroup() {
    const name = groupName.trim();

    if (!name) {
      setGroupMessage({ type: "error", text: "그룹 이름을 입력해 주세요." });
      return;
    }

    startCreate(async () => {
      const result = await createGroupAction({ facilitatorId, name });
      if (result.success && result.group) {
        const nextGroups = [...localGroups, result.group];
        setLocalGroups(nextGroups);
        setSelectedGroupId(result.group.id);
        setGroupName("");
        setGroupMessage({
          type: "success",
          text: `그룹 "${result.group.name}"이 생성되었습니다.`,
        });
        router.push(`/facilitator?userId=${facilitatorId}&groupId=${result.group.id}`);
      } else {
        setGroupMessage({
          type: "error",
          text: result.error ?? "그룹 생성에 실패했습니다.",
        });
      }
    });
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const rows = await parseWorkbookRows(file);
      const normalized = rows
        .map((row) => normalizeLearnerRow(row))
        .filter((row): row is ImportRow => row !== null);

      if (normalized.length === 0) {
        setImportMessage({
          type: "error",
          text: "파일에서 이름/이메일 컬럼을 찾지 못했습니다. 헤더를 확인해 주세요.",
        });
        return;
      }

      setImportRows(normalized);
      setImportMessage({
        type: "success",
        text: `${normalized.length}명의 학습자 목록을 찾았습니다. 등록 버튼을 눌러 반영하세요.`,
      });
    } catch (error) {
      setImportMessage({
        type: "error",
        text: error instanceof Error ? error.message : "파일 처리 중 오류가 발생했습니다.",
      });
    }
  }

  async function handleImport() {
    if (!selectedGroupId) {
      setImportMessage({ type: "error", text: "먼저 그룹을 선택하거나 생성해 주세요." });
      return;
    }
    if (importRows.length === 0) {
      setImportMessage({ type: "error", text: "등록할 학습자 목록을 먼저 올려 주세요." });
      return;
    }

    startImport(async () => {
      const result = await importLearnersAction({
        groupId: selectedGroupId,
        learners: importRows,
      });

      if (result.success) {
        setImportMessage({
          type: "success",
          text: `${result.created}명이 ${selectedGroup?.name ?? "그룹"}에 등록되었습니다.`,
        });
        setImportRows([]);
        const input = document.getElementById("learner-import-file") as HTMLInputElement | null;
        if (input) input.value = "";
      } else {
        setImportMessage({
          type: "error",
          text: result.error ?? "학습자 등록에 실패했습니다.",
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">그룹 관리</h3>
            <p className="text-sm text-slate-500">
              새 조를 만들고 학습자 명단을 CSV/XLS/XLSX로 일괄 등록할 수 있습니다.
            </p>
          </div>
        </div>

        {localGroups.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {localGroups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => {
                  setSelectedGroupId(group.id);
                  router.push(`/facilitator?userId=${facilitatorId}&groupId=${group.id}`);
                }}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  selectedGroup?.id === group.id
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>
        )}

        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label
              htmlFor="group-name"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              새 그룹 이름
            </label>
            <input
              id="group-name"
              type="text"
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              placeholder="예: 2기 C조"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={handleCreateGroup}
            disabled={isCreating}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isCreating ? "생성 중..." : "그룹 생성"}
          </button>
        </div>

        {groupMessage && (
          <div
            className={`mt-4 text-sm rounded-lg px-3 py-2 ${
              groupMessage.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {groupMessage.text}
          </div>
        )}
      </div>

      {selectedGroup && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">학습자 명단 등록</h3>
              <p className="text-sm text-slate-500">
                선택된 조: <span className="font-medium text-slate-700">{selectedGroup.name}</span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="learner-import-file"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                CSV / XLS / XLSX 파일 선택
              </label>
              <input
                id="learner-import-file"
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={handleFileUpload}
                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>

            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
              권장 컬럼: 이름, 이메일, 전화번호, 닉네임. 헤더가 있어야 하며, CSV/XLS/XLSX 모두 지원합니다.
            </div>

            {importRows.length > 0 && (
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 text-xs font-medium text-slate-600">
                  미리보기 ({importRows.length}명)
                </div>
                <div className="max-h-52 overflow-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-3 py-2">이름</th>
                        <th className="px-3 py-2">이메일</th>
                        <th className="px-3 py-2">전화번호</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importRows.slice(0, 10).map((row, index) => (
                        <tr key={`${row.email}-${index}`} className="border-t border-slate-100">
                          <td className="px-3 py-2">{row.name}</td>
                          <td className="px-3 py-2">{row.email}</td>
                          <td className="px-3 py-2">{row.phone ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {importMessage && (
              <div
                className={`text-sm rounded-lg px-3 py-2 ${
                  importMessage.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {importMessage.text}
              </div>
            )}

            <button
              type="button"
              onClick={handleImport}
              disabled={isImporting || importRows.length === 0}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isImporting ? "등록 중..." : "학습자 등록"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
