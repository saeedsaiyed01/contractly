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

export async function createDraftForm() {
  return db.form.create({
    data: { title: "Untitled form", status: "draft" },
  });
}

export async function getFormForBuilder(formId: string): Promise<BuilderForm | null> {
  const form = await db.form.findUnique({
    where: { id: formId },
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
  formId: string,
  title: string,
  description: LocalizedString,
  fields: FormFieldDraft[],
): Promise<BuilderForm> {
  const form = await db.form.findUnique({ where: { id: formId } });
  if (!form) throw new Error("Form not found");
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

  const next = await getFormForBuilder(formId);
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

export async function publishForm(formId: string): Promise<BuilderForm> {
  const form = await db.form.findUnique({ where: { id: formId } });
  if (!form) throw new Error("Form not found");
  if (form.status === "published") {
    const next = await getFormForBuilder(formId);
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

  const next = await getFormForBuilder(formId);
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
      return true;
    }),
  );

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

export async function listSubmissions(formId: string) {
  return db.submission.findMany({
    where: { formId },
    orderBy: { createdAt: "desc" },
    include: {
      answers: true,
    },
  });
}
