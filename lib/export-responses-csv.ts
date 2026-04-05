import { answerDisplay } from "@/lib/responses-display";
import type { BuilderForm } from "@/lib/forms";
import type { AppLocale, FormFieldDraft } from "@/types/form";

type AnswerRow = { fieldId: string; valueJson: unknown };

export type ExportSubmissionRow = {
  createdAt: Date | string;
  respondentLocale: string | null;
  answers: AnswerRow[];
};

function csvEscape(cell: string): string {
  if (/[",\n\r]/.test(cell)) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

function columnHeader(field: FormFieldDraft): string {
  const raw = (field.label?.en ?? "").trim();
  if (raw) return raw;
  return field.id ?? field.clientId;
}

/** Human-readable cell for CSV (English labels for choice options). */
function cellValue(
  field: FormFieldDraft | undefined,
  value: unknown,
): string {
  if (!field) {
    if (value === null || value === undefined) return "";
    return typeof value === "object" ? JSON.stringify(value) : String(value);
  }
  return answerDisplay(field, value, "en" as AppLocale);
}

export function buildResponsesCsv(
  form: BuilderForm,
  rows: ExportSubmissionRow[],
): string {
  const fieldIds = form.fields.map((f) => f.id ?? f.clientId);
  const fieldById = new Map(
    form.fields.map((f) => [f.id ?? f.clientId, f] as const),
  );

  const header = [
    "submitted_at",
    "respondent_locale",
    ...fieldIds.map((id) => {
      const f = fieldById.get(id);
      return f ? columnHeader(f) : id;
    }),
  ];

  const lines = [header.map(csvEscape).join(",")];

  for (const row of rows) {
    const at =
      typeof row.createdAt === "string"
        ? row.createdAt
        : row.createdAt.toISOString();
    const byField = new Map(
      row.answers.map((a) => [a.fieldId, a.valueJson] as const),
    );
    const cells = [
      at,
      row.respondentLocale ?? "",
      ...fieldIds.map((fid) => {
        const f = fieldById.get(fid);
        return cellValue(f, byField.get(fid));
      }),
    ];
    lines.push(cells.map(csvEscape).join(","));
  }

  return lines.join("\r\n");
}

export function buildResponsesJson(
  form: BuilderForm,
  rows: ExportSubmissionRow[],
): unknown[] {
  const fieldIds = form.fields.map((f) => f.id ?? f.clientId);
  const fieldById = new Map(
    form.fields.map((f) => [f.id ?? f.clientId, f] as const),
  );

  return rows.map((row) => {
    const at =
      typeof row.createdAt === "string"
        ? row.createdAt
        : row.createdAt.toISOString();
    const byField = new Map(
      row.answers.map((a) => [a.fieldId, a.valueJson] as const),
    );
    const answers: Record<string, string> = {};
    for (const fid of fieldIds) {
      const f = fieldById.get(fid);
      const key = f ? columnHeader(f) : fid;
      answers[key] = cellValue(f, byField.get(fid));
    }
    return {
      submitted_at: at,
      respondent_locale: row.respondentLocale,
      ...answers,
    };
  });
}
