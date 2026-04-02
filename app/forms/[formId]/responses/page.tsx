import { notFound } from "next/navigation";

import { ResponsesView } from "@/app/forms/[formId]/responses/responses-view";
import { getFormForBuilder, listSubmissions } from "@/lib/forms";

export default async function ResponsesPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const form = await getFormForBuilder(formId);
  if (!form) notFound();

  const rows = await listSubmissions(formId);
  const serialized = rows.map((s) => ({
    id: s.id,
    createdAt: s.createdAt.toISOString(),
    respondentLocale: s.respondentLocale,
    answers: s.answers.map((a) => ({
      id: a.id,
      fieldId: a.fieldId,
      valueJson: a.valueJson,
    })),
  }));

  return <ResponsesView form={form} rows={serialized} />;
}
