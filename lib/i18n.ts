import type { AppLocale } from "@/types/form";
import { APP_LOCALES } from "@/types/form";

import ar from "@/locales/ar.json";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import fr from "@/locales/fr.json";

export type Translations = typeof en;

const locales: Record<AppLocale, Translations> = {
  ar,
  en,
  es,
  fr,
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
