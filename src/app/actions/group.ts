"use server";

import { revalidatePath } from "next/cache";
import { bulkImportLearners, createGroup } from "@/lib/store";

export async function createGroupAction({
  facilitatorId,
  name,
}: {
  facilitatorId: string;
  name: string;
}) {
  const result = await createGroup(facilitatorId, name);

  if (result.success) {
    revalidatePath("/facilitator");
    revalidatePath("/");
  }

  return result;
}

export async function importLearnersAction({
  groupId,
  learners,
}: {
  groupId: string;
  learners: Array<{
    id: string;
    name: string;
  }>;
}) {
  const result = await bulkImportLearners(groupId, learners);

  if (result.success) {
    revalidatePath("/facilitator");
    revalidatePath("/admin");
  }

  return result;
}
