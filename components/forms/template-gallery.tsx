"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useLocale } from "next-intl";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { createFormFromTemplateAction } from "@/app/actions/forms";
import { AuthControls } from "@/components/auth/auth-controls";
import { AppDarkSurface } from "@/components/shell/app-dark-surface";
import { Card } from "@/components/ui/card";
import { getTranslations, parseLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { TEMPLATE_IDS, type TemplateId } from "@/lib/form-templates";
import type { AppLocale } from "@/types/form";
import { APP_LOCALES } from "@/types/form";

function TemplateThumbnail({ variant }: { variant: TemplateId }) {
  const barClass = "h-1.5 rounded-sm bg-zinc-600/35";
  const headerClass = cn(
    "mb-2 h-8 w-full rounded-md",
    variant === "blank" && "bg-zinc-700/60",
    variant === "contact" && "bg-sky-600/80",
    variant === "rsvp" && "bg-violet-600/80",
    variant === "event" && "bg-amber-600/80",
  );
  return (
    <div
      className="flex h-30 flex-col rounded-lg border border-white/10 bg-zinc-900/60 p-3"
      aria-hidden
    >
      <div className={headerClass} />
      <div className="mt-2 flex flex-1 flex-col gap-1.5">
        <div className={cn(barClass, "w-4/5")} />
        <div className={cn(barClass, "w-full")} />
        <div className={cn(barClass, "w-3/5")} />
        {variant !== "blank" && (
          <div className={cn(barClass, "mt-auto w-2/5")} />
        )}
      </div>
    </div>
  );
}

function TemplateCardSubmit({
  title,
  creatingLabel,
  children,
}: {
  title: string;
  creatingLabel: string;
  children: ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="relative w-full overflow-hidden rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/45 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:cursor-wait"
      aria-label={title}
      aria-busy={pending}
    >
      <span
        className={cn(
          "block transition-opacity duration-200",
          pending && "opacity-45",
        )}
      >
        {children}
      </span>
      {pending ? (
        <span
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-zinc-950/88 px-3 backdrop-blur-[3px]"
          aria-live="polite"
        >
          <Loader2
            className="size-8 animate-spin text-violet-400"
            strokeWidth={1.75}
            aria-hidden
          />
          <span className="text-center font-sans text-xs font-medium text-zinc-300">
            {creatingLabel}
          </span>
        </span>
      ) : null}
    </button>
  );
}

function templateCardTitle(
  t: ReturnType<typeof getTranslations>,
  id: TemplateId,
): string {
  switch (id) {
    case "blank":
      return t.templates.blank;
    case "contact":
      return t.templates.contact;
    case "rsvp":
      return t.templates.rsvp;
    case "event":
      return t.templates.event;
  }
}

export function TemplateGallery({ showDbError }: { showDbError?: boolean }) {
  const locale = useLocale();
  const [lang, setLang] = useState<AppLocale>(() => parseLocale(locale));
  const t = useMemo(() => getTranslations(lang), [lang]);

  return (
    <AppDarkSurface>
      <div className="relative">
        <header className="border-b border-white/[0.08] bg-zinc-950/75 px-4 py-4 backdrop-blur-md supports-[backdrop-filter]:bg-zinc-950/55">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
            <Link
              href="/"
              className="font-sans text-sm font-medium text-zinc-400 hover:text-zinc-100"
            >
              ← {t.nav.brand}
            </Link>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <AuthControls locale={lang} />
              <label className="sr-only" htmlFor="gallery-lang">
                {t.nav.language}
              </label>
              <select
                id="gallery-lang"
                value={lang}
                onChange={(e) => setLang(e.target.value as AppLocale)}
                className="select-app-dark py-1.5"
                aria-label={t.nav.language}
              >
                {APP_LOCALES.map((l) => (
                  <option key={l} value={l}>
                    {l.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-10">
          {showDbError && (
            <div
              role="alert"
              className="mb-8 rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 font-sans text-sm text-red-200"
            >
              {t.errors.database}
            </div>
          )}

          <div className="mb-8">
            <h1 className="font-serif text-2xl tracking-tight text-zinc-100 md:text-3xl">
              {t.templates.sectionTitle}
            </h1>
            <p className="mt-1 font-sans text-sm text-zinc-500">
              {t.templates.galleryHint}
            </p>
          </div>

          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:snap-none md:grid-cols-2 md:overflow-visible lg:grid-cols-4">
            {TEMPLATE_IDS.map((id) => {
              const title = templateCardTitle(t, id);
              return (
                <form
                  key={id}
                  action={createFormFromTemplateAction}
                  className="min-w-[min(100%,14rem)] shrink-0 snap-center md:min-w-0"
                >
                  <input type="hidden" name="templateId" value={id} />
                  <TemplateCardSubmit
                    title={title}
                    creatingLabel={t.templates.creating}
                  >
                    <Card className="overflow-hidden border-white/[0.1] bg-zinc-950/70 shadow-sm shadow-black/20 transition-all duration-200 hover:border-violet-500/25 hover:shadow-lg hover:shadow-violet-950/15">
                      <TemplateThumbnail variant={id} />
                      <div className="border-t border-white/10 px-3 py-3 font-sans text-sm font-medium text-zinc-200">
                        {title}
                      </div>
                    </Card>
                  </TemplateCardSubmit>
                </form>
              );
            })}
          </div>
        </main>
      </div>
    </AppDarkSurface>
  );
}
