import { pickLocalized } from "@/lib/localized";
import type { AppLocale, FormFieldDraft } from "@/types/form";

export function formatAnswerValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return JSON.stringify(value);
}

export function answerDisplay(
  field: FormFieldDraft | undefined,
  value: unknown,
  locale: AppLocale,
): string {
  if (!field) return formatAnswerValue(value);
  if (field.type === "multiple_choice" && typeof value === "number") {
    const opt = field.options?.[value];
    if (opt) return pickLocalized(opt, locale);
  }
  return formatAnswerValue(value);
}
