"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { FormFieldDraft, LocalizedString } from "@/types/form";
import {
  createDraftForm,
  publishForm,
  saveDraftForm,
  submitResponse,
} from "@/lib/forms";
import type { BuilderForm } from "@/lib/forms";
import {
  getDefaultFormTitle,
  getTemplateFields,
  isTemplateId,
} from "@/lib/form-templates";

export async function publishFormAction(formId: string): Promise<BuilderForm> {
  const updated = await publishForm(formId);
  revalidatePath(`/builder/${formId}`);
  revalidatePath(`/forms/${formId}`);
  if (updated.slug) {
    revalidatePath(`/f/${updated.slug}`);
  }
  return updated;
}

export async function createFormAndRedirect() {
  const form = await createDraftForm().catch((err) => {
    console.error("[createFormAndRedirect]", err);
    return null;
  });
  if (!form) {
    redirect("/?error=database");
  }
  redirect(`/builder/${form.id}`);
}

export async function createFormFromTemplateAction(formData: FormData) {
  const raw = formData.get("templateId");
  const templateId = typeof raw === "string" ? raw : "";
  if (!isTemplateId(templateId)) {
    redirect("/forms/new");
  }

  const form = await createDraftForm().catch((err) => {
    console.error("[createFormFromTemplateAction]", err);
    return null;
  });
  if (!form) {
    redirect("/forms/new?error=database");
  }

  const title = getDefaultFormTitle(templateId);
  const fields = getTemplateFields(templateId);
  const emptyDescription: LocalizedString = { en: "" };
  await saveDraftForm(form.id, title, emptyDescription, fields);
  redirect(`/builder/${form.id}`);
}

export async function saveDraftAction(
  formId: string,
  title: string,
  description: LocalizedString,
  fields: FormFieldDraft[],
): Promise<BuilderForm> {
  const next = await saveDraftForm(formId, title, description, fields);
  revalidatePath(`/builder/${formId}`);
  revalidatePath(`/forms/${formId}`);
  if (next.slug) revalidatePath(`/f/${next.slug}`);
  return next;
}

export async function submitFormAction(input: {
  formId: string;
  answers: Record<string, unknown>;
  respondentLocale?: string | null;
}) {
  await submitResponse({
    formId: input.formId,
    answers: input.answers,
    respondentLocale:
      input.respondentLocale === "en" ||
      input.respondentLocale === "es" ||
      input.respondentLocale === "hi"
        ? input.respondentLocale
        : null,
  });
  revalidatePath(`/forms/${input.formId}/responses`);
}
