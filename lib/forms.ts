import { Prisma } from "@/app/generated/prisma/client";
import { nanoid } from "nanoid";

import type { AppLocale } from "@/types/form";
import type { FormFieldDraft, LocalizedString, QuestionType } from "@/types/form";
import { db } from "@/lib/db";

export type BuilderForm = {
  id: string;
  title: string;
  description: LocalizedString;
  status: "draft" | "published";
  slug: string | null;
  fields: FormFieldDraft[];
};

function parseDescriptionJson(
  value: Prisma.JsonValue | null | undefined,
): LocalizedString {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { en: "" };
  }
  const o = value as Record<string, unknown>;
  return {
    en: typeof o.en === "string" ? o.en : "",
    ...(typeof o.es === "string" && o.es !== "" ? { es: o.es } : {}),
    ...(typeof o.hi === "string" && o.hi !== "" ? { hi: o.hi } : {}),
  };
}

/** Prisma rejects JSON objects that contain `undefined` (e.g. optional locale keys on drafts). */
function toPrismaJsonInput(value: unknown): Prisma.InputJsonValue {
  if (value === null || value === undefined) {
    return {} as Prisma.InputJsonValue;
  }
  let plain: unknown = value;
  try {
    plain = structuredClone(value);
  } catch {
    /* non-cloneable values fall through to JSON.stringify */
  }
  const encoded = JSON.stringify(plain);
  if (encoded === undefined) {
    return {} as Prisma.InputJsonValue;
  }
  return JSON.parse(encoded) as Prisma.InputJsonValue;
}

function normalizeDraftMeta(
  title: string,
  description: LocalizedString,
): { title: string; description: LocalizedString } {
  const safeTitle = typeof title === "string" ? title : "Untitled form";
  const d = description as unknown;
  if (
    d &&
    typeof d === "object" &&
    !Array.isArray(d) &&
    typeof (d as LocalizedString).en === "string"
  ) {
    return { title: safeTitle, description: d as LocalizedString };
  }
  return { title: safeTitle, description: { en: "" } };
}

function mapField(row: {
  id: string;
  sortOrder: number;
  type: string;
  required: boolean;
  labelJson: Prisma.JsonValue;
  optionsJson: Prisma.JsonValue | null;
}): FormFieldDraft {
  return {
    id: row.id,
    clientId: row.id,
    sortOrder: row.sortOrder,
    type: row.type as QuestionType,
    required: row.required,
    label: row.labelJson as LocalizedString,
    options: row.optionsJson
      ? (row.optionsJson as LocalizedString[])
      : undefined,
  };
}

export async function createDraftForm(ownerId: string) {
  return db.form.create({
    data: { title: "Untitled form", status: "draft", ownerId },
  });
}

export type FormListRow = {
  id: string;
  title: string;
  status: "draft" | "published";
  slug: string | null;
  updatedAt: Date;
  submissionCount: number;
};

export async function listFormsForOwner(
  userId: string | null,
): Promise<FormListRow[]> {
  if (!userId) return [];
  const rows = await db.form.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      slug: true,
      updatedAt: true,
      _count: { select: { submissions: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    status: r.status,
    slug: r.slug,
    updatedAt: r.updatedAt,
    submissionCount: r._count.submissions,
  }));
}

export async function getFormForBuilder(
  formId: string,
  userId: string | null,
): Promise<BuilderForm | null> {
  if (!userId) return null;
  const form = await db.form.findFirst({
    where: { id: formId, ownerId: userId },
    include: { fields: { orderBy: { sortOrder: "asc" } } },
  });
  if (!form) return null;
  return {
    id: form.id,
    title: form.title,
    description: parseDescriptionJson(form.descriptionJson),
    status: form.status,
    slug: form.slug,
    fields: form.fields.map(mapField),
  };
}

export async function saveDraftForm(
  userId: string,
  formId: string,
  title: string,
  description: LocalizedString,
  fields: FormFieldDraft[],
): Promise<BuilderForm> {
  const form = await db.form.findUnique({ where: { id: formId } });
  if (!form) throw new Error("Form not found");
  if (form.ownerId !== userId) throw new Error("Forbidden");
  if (form.status !== "draft") throw new Error("Only drafts can be edited");

  const { title: safeTitle, description: safeDescription } = normalizeDraftMeta(
    title,
    description,
  );
  const descriptionPayload = JSON.stringify(
    toPrismaJsonInput(safeDescription),
  );

  await db.$transaction(async (tx) => {
    // Raw UPDATE avoids PrismaClientValidationError when the dev bundle’s
    // generated client is stale vs schema (common with Turbopack + Json fields).
    await tx.$executeRaw(
      Prisma.sql`
        UPDATE "Form"
        SET
          "title" = ${safeTitle},
          "descriptionJson" = ${descriptionPayload}::jsonb,
          "updatedAt" = NOW()
        WHERE "id" = ${formId}
      `,
    );
    await tx.formField.deleteMany({ where: { formId } });
    for (const f of fields) {
      await tx.formField.create({
        data: {
          formId,
          sortOrder: f.sortOrder,
          type: f.type,
          required: f.required,
          labelJson: toPrismaJsonInput(f.label),
          optionsJson:
            f.options && f.options.length > 0
              ? toPrismaJsonInput(f.options)
              : Prisma.JsonNull,
        },
      });
    }
  });

  const next = await getFormForBuilder(formId, userId);
  if (!next) throw new Error("Form missing after save");
  return next;
}

async function uniqueSlug(): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const slug = nanoid(12);
    const clash = await db.form.findUnique({ where: { slug } });
    if (!clash) return slug;
  }
  return nanoid(16);
}

export async function publishForm(
  formId: string,
  userId: string,
): Promise<BuilderForm> {
  const form = await db.form.findUnique({ where: { id: formId } });
  if (!form) throw new Error("Form not found");
  if (form.ownerId !== userId) throw new Error("Forbidden");
  if (form.status === "published") {
    const next = await getFormForBuilder(formId, userId);
    if (!next) throw new Error("Form not found");
    return next;
  }

  const count = await db.formField.count({ where: { formId } });
  if (count === 0) throw new Error("Add at least one field before publishing");

  const slug = await uniqueSlug();
  await db.form.update({
    where: { id: formId },
    data: { status: "published", slug },
  });

  const next = await getFormForBuilder(formId, userId);
  if (!next) throw new Error("Form not found");
  return next;
}

export async function getPublishedFormBySlug(slug: string): Promise<BuilderForm | null> {
  const form = await db.form.findFirst({
    where: { slug, status: "published" },
    include: { fields: { orderBy: { sortOrder: "asc" } } },
  });
  if (!form) return null;
  return {
    id: form.id,
    title: form.title,
    description: parseDescriptionJson(form.descriptionJson),
    status: form.status,
    slug: form.slug,
    fields: form.fields.map(mapField),
  };
}

export async function submitResponse(input: {
  formId: string;
  answers: Record<string, unknown>;
  respondentLocale?: AppLocale | null;
}) {
  const form = await db.form.findFirst({
    where: { id: input.formId, status: "published" },
    include: { fields: true },
  });
  if (!form) throw new Error("Form not available");

  const fieldIds = new Set(form.fields.map((f) => f.id));
  for (const key of Object.keys(input.answers)) {
    if (!fieldIds.has(key)) {
      throw new Error("Invalid field in submission");
    }
  }

  const isoDate = /^\d{4}-\d{2}-\d{2}$/;

  for (const field of form.fields) {
    if (!field.required) continue;
    const v = input.answers[field.id];
    if (field.type === "multiple_choice") {
      if (typeof v !== "number" || v < 0 || !Number.isInteger(v)) {
        throw new Error(`Missing answer for field ${field.id}`);
      }
      const raw = field.optionsJson;
      const len = Array.isArray(raw) ? raw.length : 0;
      if (len === 0 || v >= len) {
        throw new Error(`Invalid choice for field ${field.id}`);
      }
    } else if (field.type === "number") {
      const n = typeof v === "number" ? v : Number(v);
      if (!Number.isFinite(n)) {
        throw new Error(`Missing answer for field ${field.id}`);
      }
    } else if (field.type === "date") {
      if (typeof v !== "string" || !isoDate.test(v.trim())) {
        throw new Error(`Missing answer for field ${field.id}`);
      }
    } else {
      if (typeof v !== "string" || v.trim() === "") {
        throw new Error(`Missing answer for field ${field.id}`);
      }
    }
  }

  const cleaned = Object.fromEntries(
    Object.entries(input.answers).filter(([, v]) => {
      if (v === undefined || v === null) return false;
      if (typeof v === "string" && v.trim() === "") return false;
      if (typeof v === "number" && !Number.isFinite(v)) return false;
      return true;
    }),
  );

  const isoDateRe = /^\d{4}-\d{2}-\d{2}$/;
  for (const field of form.fields) {
    const v = cleaned[field.id];
    if (v === undefined) continue;
    if (field.type === "number") {
      const n = typeof v === "number" ? v : Number(v);
      if (!Number.isFinite(n)) {
        throw new Error("Invalid field value");
      }
      cleaned[field.id] = n;
    } else if (field.type === "date") {
      if (typeof v !== "string" || !isoDateRe.test(v.trim())) {
        throw new Error("Invalid field value");
      }
    } else if (field.type === "multiple_choice") {
      if (typeof v !== "number" || v < 0 || !Number.isInteger(v)) {
        throw new Error("Invalid field value");
      }
      const raw = field.optionsJson;
      const len = Array.isArray(raw) ? raw.length : 0;
      if (v >= len) throw new Error("Invalid field value");
    }
  }

  await db.submission.create({
    data: {
      formId: form.id,
      respondentLocale: input.respondentLocale ?? null,
      answers: {
        create: Object.entries(cleaned).map(([fieldId, value]) => ({
          fieldId,
          valueJson: value as Prisma.InputJsonValue,
        })),
      },
    },
  });
}

export async function listSubmissions(formId: string, userId: string | null) {
  if (!userId) return [];
  const owned = await db.form.findFirst({
    where: { id: formId, ownerId: userId },
    select: { id: true },
  });
  if (!owned) return [];
  return db.submission.findMany({
    where: { formId },
    orderBy: { createdAt: "desc" },
    include: {
      answers: true,
    },
  });
}

export async function deleteForm(formId: string, userId: string): Promise<void> {
  const form = await db.form.findUnique({ where: { id: formId } });
  if (!form) throw new Error("Form not found");
  if (form.ownerId !== userId) throw new Error("Forbidden");
  await db.form.delete({ where: { id: formId } });
}

/** Move published form back to draft; clears public slug so the old link stops working. */
export async function unpublishForm(
  formId: string,
  userId: string,
): Promise<BuilderForm> {
  const form = await db.form.findUnique({ where: { id: formId } });
  if (!form) throw new Error("Form not found");
  if (form.ownerId !== userId) throw new Error("Forbidden");
  if (form.status !== "published") {
    const next = await getFormForBuilder(formId, userId);
    if (!next) throw new Error("Form not found");
    return next;
  }
  await db.form.update({
    where: { id: formId },
    data: { status: "draft", slug: null },
  });
  const next = await getFormForBuilder(formId, userId);
  if (!next) throw new Error("Form not found");
  return next;
}

/** Copy form definition into a new draft owned by the same user. */
export async function duplicateForm(
  formId: string,
  userId: string,
): Promise<{ newFormId: string }> {
  const source = await getFormForBuilder(formId, userId);
  if (!source) throw new Error("Form not found");

  const draft = await createDraftForm(userId);
  const copyTitle =
    source.title.trim() === "" || source.title === "Untitled form"
      ? "Untitled form (copy)"
      : `${source.title} (copy)`;

  const fieldsCopy: FormFieldDraft[] = source.fields.map((f, i) => ({
    clientId: nanoid(),
    sortOrder: i,
    type: f.type,
    required: f.required,
    label: { ...f.label },
    options: f.options?.map((o) => ({ ...o })),
  }));

  await saveDraftForm(userId, draft.id, copyTitle, source.description, fieldsCopy);
  return { newFormId: draft.id };
}
