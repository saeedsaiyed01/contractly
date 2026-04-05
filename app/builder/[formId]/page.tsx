import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { BuilderClient } from "@/app/builder/[formId]/builder-client";
import { getFormForBuilder } from "@/lib/forms";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { userId } = await auth();
  const { formId } = await params;
  const form = await getFormForBuilder(formId, userId);
  if (!form) notFound();
  return <BuilderClient initial={form} />;
}
