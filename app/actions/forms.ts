"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { consumeSubmitRateToken } from "@/lib/rate-limit";
import type { FormFieldDraft, LocalizedString } from "@/types/form";
import {
  createDraftForm,
  deleteForm,
  duplicateForm,
  publishForm,
  saveDraftForm,
  submitResponse,
  unpublishForm,
} from "@/lib/forms";
import type { BuilderForm } from "@/lib/forms";
import {
  getDefaultFormTitle,
  getTemplateFields,
  isTemplateId,
} from "@/lib/form-templates";

async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return userId;
}

export async function publishFormAction(formId: string): Promise<BuilderForm> {
  const userId = await requireUserId();
  const updated = await publishForm(formId, userId);
  revalidatePath(`/builder/${formId}`);
  revalidatePath(`/forms/${formId}`);
  if (updated.slug) {
    revalidatePath(`/f/${updated.slug}`);
  }
  return updated;
}

export async function createFormAndRedirect() {
  const userId = await requireUserId();
  const form = await createDraftForm(userId).catch((err) => {
    console.error("[createFormAndRedirect]", err);
    return null;
  });
  if (!form) {
    redirect("/?error=database");
  }
  redirect(`/builder/${form.id}`);
}

export async function createFormFromTemplateAction(formData: FormData) {
  const userId = await requireUserId();
  const raw = formData.get("templateId");
  const templateId = typeof raw === "string" ? raw : "";
  if (!isTemplateId(templateId)) {
    redirect("/forms/new");
  }

  const form = await createDraftForm(userId).catch((err) => {
    console.error("[createFormFromTemplateAction]", err);
    return null;
  });
  if (!form) {
    redirect("/forms/new?error=database");
  }

  const title = getDefaultFormTitle(templateId);
  const fields = getTemplateFields(templateId);
  const emptyDescription: LocalizedString = { en: "" };
  await saveDraftForm(userId, form.id, title, emptyDescription, fields);
  redirect(`/builder/${form.id}`);
}

export async function saveDraftAction(
  formId: string,
  title: string,
  description: LocalizedString,
  fields: FormFieldDraft[],
): Promise<BuilderForm> {
  const userId = await requireUserId();
  const next = await saveDraftForm(userId, formId, title, description, fields);
  revalidatePath(`/builder/${formId}`);
  revalidatePath(`/forms/${formId}`);
  if (next.slug) revalidatePath(`/f/${next.slug}`);
  return next;
}

export async function deleteFormAction(formId: string) {
  const userId = await requireUserId();
  await deleteForm(formId, userId);
  revalidatePath("/dashboard");
  revalidatePath(`/forms/${formId}`);
  revalidatePath(`/forms/${formId}/responses`);
  redirect("/dashboard");
}

export async function unpublishFormAction(formId: string): Promise<BuilderForm> {
  const userId = await requireUserId();
  const prev = await db.form.findUnique({
    where: { id: formId },
    select: { slug: true },
  });
  const next = await unpublishForm(formId, userId);
  revalidatePath(`/builder/${formId}`);
  revalidatePath(`/forms/${formId}`);
  revalidatePath(`/forms/${formId}/responses`);
  revalidatePath("/dashboard");
  if (prev?.slug) revalidatePath(`/f/${prev.slug}`);
  return next;
}

export async function duplicateFormAction(formId: string) {
  const userId = await requireUserId();
  const { newFormId } = await duplicateForm(formId, userId);
  revalidatePath("/dashboard");
  redirect(`/builder/${newFormId}`);
}

export async function submitFormAction(input: {
  formId: string;
  answers: Record<string, unknown>;
  respondentLocale?: string | null;
  /** Honeypot — must stay empty */
  _website?: string;
}) {
  if (input._website != null && String(input._website).trim() !== "") {
    throw new Error("Submission failed");
  }

  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown";
  const rateKey = `${input.formId}:${ip}`;
  if (!consumeSubmitRateToken(rateKey)) {
    throw new Error("Too many submissions. Try again in a minute.");
  }

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
