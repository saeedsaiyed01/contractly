import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import ar from "@/locales/ar.json";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import fr from "@/locales/fr.json";
import { parseLocale } from "@/lib/i18n";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = parseLocale(cookieStore.get("APP_LOCALE")?.value);
  const messages =
    locale === "ar" ? ar : locale === "fr" ? fr : locale === "es" ? es : en;

  return {
    locale,
    messages,
  };
});
