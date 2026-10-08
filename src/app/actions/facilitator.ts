"use server";

import { revalidatePath } from "next/cache";
import { createFacilitator } from "@/lib/store";

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
