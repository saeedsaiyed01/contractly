import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { ManageFormClient } from "@/app/forms/[formId]/manage-form-client";
import { getFormForBuilder, listSubmissions } from "@/lib/forms";

export default async function ManageFormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { userId } = await auth();
  const { formId } = await params;
  const form = await getFormForBuilder(formId, userId);
  if (!form) notFound();

  const rows = await listSubmissions(formId, userId);
  const last = rows[0]?.createdAt ?? null;

  return (
    <ManageFormClient
      form={{
        id: form.id,
        title: form.title,
        status: form.status,
        slug: form.slug,
      }}
      submissionCount={rows.length}
      lastSubmissionIso={last ? last.toISOString() : null}
    />
  );
}
