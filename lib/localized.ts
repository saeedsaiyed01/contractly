import type { AppLocale, LocalizedString } from "@/types/form";

export function pickLocalized(
  value: LocalizedString,
  locale: AppLocale,
): string {
  const v = value[locale] ?? value.en;
  return v ?? "";
}

export function pickLocalizedOption(
  options: LocalizedString[] | undefined,
  index: number,
  locale: AppLocale,
): string {
  const o = options?.[index];
  if (!o) return "";
  return pickLocalized(o, locale);
}
