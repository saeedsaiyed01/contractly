import type { AppLocale, FormFieldDraft, LocalizedString } from "@/types/form";

export function placeholderFromEn(
  value: LocalizedString,
  locale: AppLocale,
): string | undefined {
  if (locale === "en") return undefined;
  const current = value[locale];
  if (current !== undefined && current.length > 0) return undefined;
  if (!value.en) return undefined;
  return value.en;
}

export function setLocalizedString(
  base: LocalizedString,
  locale: AppLocale,
  text: string,
): LocalizedString {
  if (locale === "en") {
    return { ...base, en: text };
  }
  if (text.trim() === "") {
    const next = { ...base } as Record<string, string | undefined>;
    delete next[locale];
    return next as LocalizedString;
  }
  return { ...base, [locale]: text };
}

export function setOptionAtLocale(
  field: FormFieldDraft,
  optionIndex: number,
  locale: AppLocale,
  text: string,
): LocalizedString[] {
  const options = [...(field.options ?? [])];
  const cur = options[optionIndex];
  if (!cur) return options;
  options[optionIndex] = setLocalizedString(cur, locale, text);
  return options;
}
