import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { createDraftForm } from "@/lib/forms";

export default async function CreatePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const form = await createDraftForm(userId).catch((err) => {
    console.error("[CreatePage]", err);
    return null;
  });
  if (!form) redirect("/?error=database");
  redirect(`/builder/${form.id}`);
}
