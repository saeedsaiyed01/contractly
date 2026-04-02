import { notFound } from "next/navigation";

import { BuilderClient } from "@/app/builder/[formId]/builder-client";
import { getFormForBuilder } from "@/lib/forms";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const form = await getFormForBuilder(formId);
  if (!form) notFound();
  return <BuilderClient initial={form} />;
}
