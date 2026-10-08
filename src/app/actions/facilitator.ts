"use server";

import { revalidatePath } from "next/cache";
import { createFacilitator, setFacilitatorActive } from "@/lib/store";

export async function createFacilitatorAction(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const nickname = String(formData.get("nickname") ?? "");
  const email = String(formData.get("email") ?? "");
  const phone = String(formData.get("phone") ?? "");

  const result = await createFacilitator({ name, nickname, email, phone });

  if (result.success) {
    revalidatePath("/admin");
    revalidatePath("/");
  }

  return result;
}

/** 퍼실리테이터 활성/비활성 (삭제가 아님) */
export async function setFacilitatorActiveAction(
  facilitatorId: string,
  isActive: boolean
) {
  const result = await setFacilitatorActive(facilitatorId, isActive);

  if (result.success) {
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/facilitator");
  }

  return result;
}
