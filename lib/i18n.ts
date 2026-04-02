import type { AppLocale } from "@/types/form";
import { APP_LOCALES } from "@/types/form";

import en from "@/locales/en.json";
import es from "@/locales/es.json";
import hi from "@/locales/hi.json";

export type Translations = typeof en;

const locales: Record<AppLocale, Translations> = {
  en,
  es,
  hi,
};

export function getTranslations(lang: AppLocale): Translations {
  return locales[lang] ?? en;
}

export function isAppLocale(value: string): value is AppLocale {
  return (APP_LOCALES as readonly string[]).includes(value);
}

export function parseLocale(value: string | null | undefined): AppLocale {
  if (value && isAppLocale(value)) return value;
  return "en";
}
